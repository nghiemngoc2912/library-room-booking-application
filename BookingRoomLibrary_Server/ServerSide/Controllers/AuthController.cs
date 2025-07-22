using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Auth;
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

                // Store user information in session
                HttpContext.Session.SetString("UserId", account.Id.ToString());
                HttpContext.Session.SetString("Username", account.Username);
                HttpContext.Session.SetInt32("Role", account.Role);

                return Ok(new
                {
                    id = account.Id,
                    username = account.Username,
                    role = account.Role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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

    }
}

