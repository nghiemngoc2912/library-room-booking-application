using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using ServerSide.DTOs;
using MailKit.Net.Smtp;


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
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart("html") { Text = htmlContent };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
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
    }

    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlContent);
        Task SendOtpEmail(string toUsername, string otpCode);
    }
}
