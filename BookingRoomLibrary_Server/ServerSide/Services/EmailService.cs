using Microsoft.Extensions.Options;
using ServerSide.DTOs;
using System.Net.Mail;
using System.Net;

namespace ServerSide.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlContent)
        {
            var mailMessage = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                Body = htmlContent,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            using var smtpClient = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
                EnableSsl = true
            };

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi để debug (nếu bạn đã bật logging)
                Console.WriteLine($"Lỗi gửi email: {ex.Message}");
                throw; // Ném lỗi để ứng dụng xử lý
            }
        }

        public async Task SendOtpEmail(string toUsername, string otpCode)
        {
            var subject = "Mã xác thực OTP của bạn";
            var body = $@"
            <h3>Xác thực tài khoản</h3>
            <p>Xin chào {toUsername},</p>
            <p>Mã OTP của bạn là: <b>{otpCode}</b></p>
            <p>Mã có hiệu lực trong 2 phút.</p>";

            await SendEmailAsync(toUsername, subject, body);
        }

        public async Task SendForgotPasswordEmail(string toEmail, string resetLink)
        {
            string subject = "Reset your password";
            string body = $@"
        <p>You requested to reset your password.</p>
        <p>Click <a href='{resetLink}'>here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendReputationChangeEmailAsync(string email, string fullName, int newReputation, int change, string reason)
        {
            // Implementation would use an email provider (e.g., SMTP, SendGrid, etc.)
            // For this example, we'll simulate sending an email
            string subject = "Reputation Change Notification";
            string body = $@"
                Dear {fullName},

                Your reputation score has been updated.
                Change: {change} points
                Reason: {reason}
                New Reputation: {newReputation}

                Please contact support if you have any questions.

                Best regards,
                Room Booking System
                ";

            await SendEmailAsync(email, subject, body);
        }

    }

    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlContent);
        Task SendOtpEmail(string toUsername, string otpCode);
        Task SendForgotPasswordEmail(string toEmail, string resetLink);
        Task SendReputationChangeEmailAsync(string email, string fullName, int newReputation, int change, string reason);
    }
}