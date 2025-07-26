using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs;
using ServerSide.DTOs.Auth;
using ServerSide.DTOs.Account;
using ServerSide.Services;
using System.Security.Cryptography;
using System.Text;

namespace ServerSide.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;
        private IEmailService _emailService;

        public AuthController(IAuthService authService, IEmailService emailService)
        {
            _authService = authService;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO loginDto)
        {
            try
            {
                var account = _authService.Authenticate(loginDto);
                if (account == null)
                {
                    return Unauthorized(new { message = "Invalid username or password" });
                }

                if (account.Status == (int)Constants.AccountStatus.Inactive)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Tài khoản bị khóa",
                        status = account.Status
                    });
                }
                var userId = _authService.GetUserIdByAccountId(account.Id);

                HttpContext.Session.SetString("AccountId", account.Id.ToString());
                HttpContext.Session.SetString("UserId", userId.ToString());
                HttpContext.Session.SetString("Username", account.Username);
                HttpContext.Session.SetInt32("Role", account.Role);

                return Ok(new
                {
                    success = true,
                    id = account.Id,
                    username = account.Username,
                    role = account.Role
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "An error occurred during login.", error = ex.Message });
            }
        }

        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            var userId = HttpContext.Session.GetString("UserId");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("SESSION NOT FOUND");
                return Unauthorized(new { message = "Not logged in" });
            }

            Console.WriteLine("SESSION FOUND: " + userId);

            return Ok(new
            {
                id = userId,
                username = HttpContext.Session.GetString("Username"),
                role = HttpContext.Session.GetInt32("Role")
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateAccountStudentDTO dto)
        {
            try
            {
                var otpCode = await _authService.RegisterStudentAsync(dto); 
                await _emailService.SendOtpEmail(dto.Username, otpCode);
                return Ok(new { success = true, message = "Registration initiated. Please check your email for OTP." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDTO dto)
        {
            try
            {
                await _authService.VerifyOtpAsync(dto.Username, dto.OtpCode);
                return Ok(new { success = true, message = "Account verified successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            Response.Cookies.Delete(".AspNetCore.Session"); 
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("test")]
        public string CheckHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromQuery] string username)
        {
            string decodedUsername = Uri.UnescapeDataString(username); // 👈 Giải mã %40 thành @

            string otp = new Random().Next(100000, 999999).ToString();

            // Save OTP to DB nếu cần...

            await _emailService.SendOtpEmail(decodedUsername, otp);
            return Ok("OTP sent");
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO dto)
        {
            Console.WriteLine("[DEBUG] DTO nhận được:");
            Console.WriteLine($"Email: {dto.Email}");

            try
            {
                await _authService.ForgotPasswordAsync(dto.Email);
                return Ok("Reset password email sent.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            try
            {
                Console.WriteLine($"[DEBUG] DTO nhận được:");
                Console.WriteLine($"Token: {dto.Token}");
                Console.WriteLine($"NewPassword: {dto.NewPassword}");
                Console.WriteLine($"ConfirmPassword: {dto.ConfirmPassword}");

                await _authService.ResetPasswordAsync(dto);
                return Ok("Password reset successful.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

