using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Auth;
using ServerSide.DTOs.Student;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly IAuthService _authService;

        public StudentController(IStudentService studentService, IAuthService authService)
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }

        [HttpGet("{userId}/related")]
        public async Task<IActionResult> GetRelatedStudents(int userId)
        {
            var students = await _studentService.GetRelatedStudentsAsync(userId);
            return Ok(students);
        }

        [HttpPost("{studentId}/subtract-reputation")]
        public async Task<IActionResult> SubtractReputation(int studentId, [FromBody] ReputationAdjustmentRequest request)
        {
            try
            {
                await _studentService.SubtractReputationAsync(studentId, request.Change, request.Reason);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{userId}/change-password")]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordDTO changePasswordDto)
        {
            try
            {
                await _authService.ChangePasswordAsync(userId, changePasswordDto);
                return Ok("Password changed successfully.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(ex.Message); // "Current password is incorrect."
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message); // "New password must be at least 8 characters long." hoặc "New password and confirm password do not match."
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); // "Account with UserId {userId} not found."
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("{reporterId}/subtract-related")]
        public async Task<IActionResult> SubtractReputationFromRelated(int reporterId, [FromBody] ReputationAdjustmentRequest request)
        {
            try
            {
                await _studentService.SubtractReputationFromRelatedStudentsAsync(reporterId, request.Change, request.Reason);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class ReputationAdjustmentRequest
    {
        public int Change { get; set; }  // Ví dụ: -10 để trừ điểm
        public string Reason { get; set; } = string.Empty;
    }
}
