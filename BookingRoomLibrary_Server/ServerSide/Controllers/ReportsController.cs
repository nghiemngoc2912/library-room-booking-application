using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs;
using ServerSide.DTOs.Report;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService ?? throw new ArgumentNullException(nameof(reportService));
        }

        [HttpGet]
        public async Task<IActionResult> GetReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            try
            {
                var report = await _reportService.GetReportByIdAsync(id);
                return Ok(report);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Report with ID {id} not found.");
            }
        }

        [HttpGet("user/{userId}/types")]
        public async Task<IActionResult> GetReportTypesByUser(int userId)
        {
            try
            {
                var reports = await _reportService.GetAllReportsAsync();
                var reportTypes = reports
                    .Where(r => r.UserId == userId && !string.IsNullOrWhiteSpace(r.ReportType))
                    .Select(r => r.ReportType)
                    .Distinct()
                    .ToList();
                return Ok(reportTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving report types: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] ReportDTO reportDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _reportService.CreateReportAsync(reportDto);
                return CreatedAtAction(nameof(GetReport), new { id = reportDto.Id }, reportDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReport(int id, [FromBody] ReportDTO reportDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                reportDto.Id = id; // Đảm bảo ID khớp
                await _reportService.UpdateReportAsync(reportDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Report with ID {id} not found.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            try
            {
                await _reportService.DeleteReportAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Report with ID {id} not found.");
            }
        }
    }
}