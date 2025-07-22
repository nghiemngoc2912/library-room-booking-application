using ServerSide.Constants;
using ServerSide.DTOs.Auth;
using ServerSide.Models;
using ServerSide.Repositories;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace ServerSide.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;
        private readonly OtpRuleOptions _otpRuleOptions;

        public AuthService(IAuthRepository authRepository, IOtpRepository tpRepository, IEmailService emailService, IOptions<OtpRuleOptions> otpOptions)
        {
            _authRepository = authRepository;
            _otpRepository = tpRepository;
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

            // Verify password
            var inputPasswordHash = ComputeHash(loginDto.Password);
            if (inputPasswordHash != account.PasswordHash)
            {
                return null;
            }

            return account;
        }

        private string ComputeHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto)
        {
            // Lấy thông tin tài khoản từ repository
            var account = await _authRepository.GetAccountByUserIdAsync(userId);
            if (account == null)
            {
                throw new KeyNotFoundException($"Account with UserId {userId} not found.");
            }

            // Kiểm tra mật khẩu hiện tại
            var currentPasswordHash = ComputeHash(changePasswordDto.CurrentPassword);
            if (currentPasswordHash != account.PasswordHash)
            {
                throw new UnauthorizedAccessException("Current password is incorrect.");
            }

            // Kiểm tra độ dài mật khẩu mới
            if (changePasswordDto.NewPassword.Length < 8)
            {
                throw new ArgumentException("New password must be at least 8 characters long.");
            }

            // Kiểm tra confirm password
            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
            {
                throw new ArgumentException("New password and confirm password do not match.");
            }

            // Mã hóa mật khẩu mới và cập nhật
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
                Username = email,
                Code = Guid.NewGuid().ToString(),
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

            var otp = await _otpRepository.GetValidOtpAsync(dto.Token, 1);
            if (otp == null) throw new Exception("Invalid or expired token");

            var account = _authRepository.GetAccountByUsername(otp.Username);
            if (account == null) throw new Exception("Account not found");

            account.PasswordHash = ComputeHash(dto.NewPassword);
            await _authRepository.UpdateAccountAsync(account);
            await _otpRepository.MarkOtpAsUsedAsync(otp);
        }

    }

    public interface IAuthService
    {
        Account Authenticate(LoginDTO loginDto);
        Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(ResetPasswordDTO dto);

    }
}
