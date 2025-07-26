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
            var account = _authRepository.GetAccountByUsername(email);
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

            var existingAccount = _authRepository.GetAccountByUsername(dto.Username);
            if (existingAccount != null)
            {
                throw new ArgumentException("Username đã tồn tại.");
            }

            var existingOtp = await _otpRepository.GetActiveOtpByUsernameAsync(dto.Username, (int)OtpType.Registration);
            if (existingOtp != null)
            {
                var waitTime = (existingOtp.ExpiredAt - DateTime.UtcNow).TotalMinutes;
                throw new InvalidOperationException($"Mã OTP đã được gửi. Vui lòng đợi khoảng {Math.Ceiling(waitTime)} phút trước khi thử lại.");
            }

            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            var otpCode = GenerateOtpCode();
            var otp = new OtpCode
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Code = otpCode,
                OtpType = (int)OtpType.Registration,
                IsUsed = false,
                CreatedAt = now,
                ExpiredAt = now.AddMinutes(_otpRuleOptions.TimeExpiredResetPasswordMinutes)
            };
            Console.WriteLine($"[OTP DEBUG] ExpiredResetPasswordMinutes: {_otpRuleOptions.TimeExpiredResetPasswordMinutes}");
            // Generate student code
            string studentCode = await GenerateStudentCodeAsync();

            var account = new Account
            {
                Username = dto.Username,
                PasswordHash = ComputeHash(dto.Password),
                Role = (byte)Roles.Student,
                Status = (byte)AccountStatus.Inactive
            };

            var user = new User
            {
                FullName = dto.FullName,
                Dob = dto.Dob,
                Code = studentCode,
                Reputation = 0
            };

            await _accountRepository.CreateLibrarianAsync(account, user);
            await _otpRepository.CreateOtpAsync(otp);

            return otpCode;
        }

        public async Task VerifyOtpAsync(string username, string otpCode)
        {
            var otp = await _otpRepository.GetValidOtpAsync(otpCode, (int)OtpType.Registration);
            if (otp == null || otp.Username != username)
            {
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            var account = _authRepository.GetAccountByUsername(username);
            if (account == null)
            {
                throw new Exception("Tài khoản không tồn tại.");
            }

            account.Status = (byte)AccountStatus.Active;
            await _authRepository.UpdateAccountAsync(account);
            await _otpRepository.MarkOtpAsUsedAsync(otp);
        }

        private async Task<string> GenerateStudentCodeAsync()
        {
            var latestUser = await _accountRepository.GetLatestStudentAsync();
            int nextNumber = 1; // Default if no students exist

            if (latestUser != null && !string.IsNullOrEmpty(latestUser.Code) && latestUser.Code.StartsWith("ST"))
            {
                if (int.TryParse(latestUser.Code.Substring(2), out int number))
                {
                    nextNumber = number + 1;
                }
            }

            return $"ST{nextNumber:D3}"; // Ensures at least 3 digits (e.g., ST001, ST124)
        }

        private string GenerateOtpCode()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        public int GetUserIdByAccountId(int accountId)
        {
            return _authRepository.GetUserIdByAccountId(accountId);
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
    }
}