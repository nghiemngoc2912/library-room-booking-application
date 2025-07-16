using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Student;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
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
    }

    public class ReputationAdjustmentRequest
    {
        public int Change { get; set; } // Số điểm trừ
        public string Reason { get; set; }
    }
}