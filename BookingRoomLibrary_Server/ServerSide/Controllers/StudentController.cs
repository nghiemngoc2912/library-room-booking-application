using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Auth;
using ServerSide.Constants;
using ServerSide.DTOs.Student;
using ServerSide.DTOs.User;
using ServerSide.Filters;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly IAuthService _authService;
        private readonly IAccountService _accountService;

        public StudentController(IStudentService studentService, IAuthService authService, IAccountService accountService)
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
            _accountService = accountService;
        }
        [RoleFilter((int)Roles.Staff)]
        [HttpGet("{userId}/related")]
        public async Task<IActionResult> GetRelatedStudents(int userId)
        {
            var students = await _studentService.GetRelatedStudentsAsync(userId);
            return Ok(students);
        }
        [RoleFilter((int)Roles.Staff)]
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
                return BadRequest(ex.Message); 
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message); 
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); 
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
        public int Change { get; set; }  
        public string Reason { get; set; } = string.Empty;
    }
}
