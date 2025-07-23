using Microsoft.AspNetCore.Mvc;
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
        private readonly IAccountService _accountService;

        public StudentController(IStudentService studentService, IAccountService accountService)
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
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
        [HttpPut("register")]
        public async Task<IActionResult> Register(UserRegisterDTO createUserDTO)
        {
            try
            {
                await _accountService.RegisterAsync(createUserDTO,(byte)Roles.Student);
                return Ok("Register successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class ReputationAdjustmentRequest
    {
        public int Change { get; set; } // Số điểm trừ
        public string Reason { get; set; }
    }
}