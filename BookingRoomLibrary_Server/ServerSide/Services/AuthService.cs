using Microsoft.Extensions.Options;
using ServerSide.Constants;
using ServerSide.DTOs.Auth;
using ServerSide.Models;
using ServerSide.Repositories;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace ServerSide.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IOtpRepository _otpRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IEmailService _emailService;
        private readonly OtpRuleOptions _otpRuleOptions;
        private static readonly Dictionary<string, PendingRegistration> _pendingRegistrations = new();

        public AuthService(
            IAuthRepository authRepository,
            IOtpRepository otpRepository,
            IAccountRepository accountRepository,
            IEmailService emailService,
            IOptions<OtpRuleOptions> otpOptions)
        {
            _authRepository = authRepository;
            _otpRepository = otpRepository;
            _accountRepository = accountRepository;
            _emailService = emailService;
            _otpRuleOptions = otpOptions.Value;
        }

        public Account Authenticate(LoginDTO loginDto)
        {
            var account = _authRepository.GetAccountByUsername(loginDto.Username);
            if (account == null)
            {
                return null;
            }

            var inputPasswordHash = ComputeHash(loginDto.Password);
            if (inputPasswordHash != account.PasswordHash)
            {
                return null;
            }

            return account;
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto)
        {
            var account = await _authRepository.GetAccountByUserIdAsync(userId);
            if (account == null)
            {
                throw new KeyNotFoundException($"Account with UserId {userId} not found.");
            }

            var currentPasswordHash = ComputeHash(changePasswordDto.CurrentPassword);
            if (currentPasswordHash != account.PasswordHash)
            {
                throw new UnauthorizedAccessException("Current password is incorrect.");
            }

            if (changePasswordDto.NewPassword.Length < 8)
            {
                throw new ArgumentException("New password must be at least 8 characters long.");
            }

            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
            {
                throw new ArgumentException("New password and confirm password do not match.");
            }

            var newPasswordHash = ComputeHash(changePasswordDto.NewPassword);
            account.PasswordHash = newPasswordHash;
            await _authRepository.UpdateAccountAsync(account);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            Account account = await _authRepository.GetAccountByUsernameSyn(email);
            if (account == null)
                throw new Exception("Email không tồn tại trong hệ thống.");

            var existingOtp = await _otpRepository.GetActiveOtpByUsernameAsync(email, (int)OtpType.ForgotPassword);
            if (existingOtp != null)
            {
                var waitTime = (existingOtp.ExpiredAt - DateTime.UtcNow).TotalMinutes;
                throw new InvalidOperationException($"Mã OTP đã được gửi. Vui lòng đợi khoảng {Math.Ceiling(waitTime)} phút trước khi thử lại.");
            }

            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            var otp = new OtpCode
            {
                Id = Guid.NewGuid(),
                Username = email,
                Code = GenerateOtpCode(),
                OtpType = (int)OtpType.ForgotPassword,
                IsUsed = false,
                CreatedAt = now,
                ExpiredAt = now.AddMinutes(_otpRuleOptions.TimeExpiredResetPasswordMinutes)
            };

            await _otpRepository.CreateOtpAsync(otp);

            string resetLink = $"http://localhost:3000/reset-password?token={otp.Code}";
            await _emailService.SendForgotPasswordEmail(email, resetLink);
        }

        public async Task ResetPasswordAsync(ResetPasswordDTO dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                throw new ArgumentException("Passwords do not match");

            var otp = await _otpRepository.GetValidOtpAsync(dto.Token, (int)OtpType.ForgotPassword);
            if (otp == null) throw new Exception("Invalid or expired token");

            var account = _authRepository.GetAccountByUsername(otp.Username);
            if (account == null) throw new Exception("Account not found");

            account.PasswordHash = ComputeHash(dto.NewPassword);
            await _authRepository.UpdateAccountAsync(account);
            await _otpRepository.MarkOtpAsUsedAsync(otp);
        }

        public string ComputeHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        public async Task<string> RegisterStudentAsync(CreateAccountStudentDTO dto)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(dto.Username))
            {
                throw new ArgumentException("Username phải là một địa chỉ email hợp lệ.");
            }

            if (dto.Password.Length < 8)
            {
                throw new ArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");
            }

            // Lấy giờ Việt Nam hiện tại
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            var existingOtp = await _otpRepository.GetActiveOtpByUsernameAsync(dto.Username, (int)OtpType.Registration);
            if (existingOtp != null)
            {
                var waitTime = (existingOtp.ExpiredAt - nowVN).TotalMinutes;
                if (waitTime > 0)
                {
                    throw new InvalidOperationException($"Mã OTP đã được gửi. Vui lòng đợi khoảng {Math.Ceiling(waitTime)} phút trước khi thử lại.");
                }
            }

            var otpCode = GenerateOtpCode();
            var otp = new OtpCode
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Code = otpCode,
                OtpType = (int)OtpType.Registration,
                IsUsed = false,
                CreatedAt = nowVN,
                ExpiredAt = nowVN.AddMinutes(_otpRuleOptions.TimeExpiredResetPasswordMinutes)
            };

            // Tạo code sinh viên và lưu vào pending registration
            string studentCode = await GenerateStudentCodeAsync();

            // Lưu tạm vào dictionary (chưa lưu DB)
            _pendingRegistrations[dto.Username] = new PendingRegistration
            {
                Username = dto.Username,
                Password = dto.Password,
                FullName = dto.FullName,
                Dob = dto.Dob.HasValue
                    ? new DateTime(dto.Dob.Value.Year, dto.Dob.Value.Month, dto.Dob.Value.Day)
                    : (DateTime?)null,
                StudentCode = studentCode // Lưu mã sinh viên
            };

            await _otpRepository.CreateOtpAsync(otp);
            return otpCode;
        }

        public async Task VerifyOtpAsync(string username, string otpCode)
        {
            var otp = await _otpRepository.GetValidOtpAsync(otpCode, (int)OtpType.Registration);
            if (otp == null || otp.Username != username)
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn.");

            // Kiểm tra bổ sung thời gian hết hạn và trạng thái sử dụng
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);
            if (otp.ExpiredAt <= nowVN)
                throw new Exception("Mã OTP đã hết hạn. Vui lòng yêu cầu mã OTP mới.");
            if (otp.IsUsed)
                throw new Exception("Mã OTP đã được sử dụng.");

            if (!_pendingRegistrations.TryGetValue(username, out var registrationData))
                throw new Exception("Không tìm thấy thông tin đăng ký tạm.");

            var account = new Account
            {
                Username = registrationData.Username,
                PasswordHash = ComputeHash(registrationData.Password),
                Role = (byte)Roles.Student,
                Status = (byte)AccountStatus.Active
            };

            var user = new User
            {
                FullName = registrationData.FullName,
                Dob = registrationData.Dob.HasValue ? DateOnly.FromDateTime(registrationData.Dob.Value) : null,
                Code = registrationData.StudentCode,
                Reputation = 100
            };

            await _accountRepository.CreateLibrarianAsync(account, user);
            await _otpRepository.MarkOtpAsUsedAsync(otp);

            _pendingRegistrations.Remove(username);
        }

        private async Task<string> GenerateStudentCodeAsync()
        {
            // Lấy tất cả sinh viên có mã bắt đầu bằng "ST"
            var students = await _accountRepository.GetStudentsWithSTCodeAsync();
            int maxNumber = 0;

            foreach (var student in students)
            {
                if (student.Code != null && student.Code.StartsWith("ST") && student.Code.Length > 2)
                {
                    if (int.TryParse(student.Code.Substring(2), out int number))
                    {
                        maxNumber = Math.Max(maxNumber, number);
                    }
                }
            }

            int nextNumber = maxNumber + 1;
            return $"ST{nextNumber:D3}"; // Đảm bảo định dạng ST001, ST002, v.v.
        }

        private string GenerateOtpCode()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        public int GetUserIdByAccountId(int accountId)
        {
            return _authRepository.GetUserIdByAccountId(accountId);
        }

        public async Task<OtpCode> GetActiveOtpByUsernameAsync(string username, int otpType)
        {
            return await _otpRepository.GetActiveOtpByUsernameAsync(username, otpType);
        }

        public async Task<string> GenerateNewOtpAsync(string username, int otpType)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            var otp = new OtpCode
            {
                Id = Guid.NewGuid(),
                Username = username,
                Code = GenerateOtpCode(),
                OtpType = otpType,
                IsUsed = false,
                CreatedAt = nowVN,
                ExpiredAt = nowVN.AddMinutes(_otpRuleOptions.TimeExpiredResetPasswordMinutes)
            };

            await _otpRepository.CreateOtpAsync(otp);
            return otp.Code;
        }
    }

    public interface IAuthService
    {
        Account Authenticate(LoginDTO loginDto);
        Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(ResetPasswordDTO dto);
        string ComputeHash(string input);
        Task<string> RegisterStudentAsync(CreateAccountStudentDTO dto);
        Task VerifyOtpAsync(string username, string otpCode);
        int GetUserIdByAccountId(int accountId);
        Task<OtpCode> GetActiveOtpByUsernameAsync(string username, int otpType);
        Task<string> GenerateNewOtpAsync(string username, int otpType);
    }
}