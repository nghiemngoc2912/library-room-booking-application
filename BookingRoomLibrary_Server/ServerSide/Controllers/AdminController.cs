using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Admin;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("statistics/bookings")]
        public IActionResult GetBookingStatistics(
            [FromQuery] string period = "month",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var data = _adminService.GetBookingStatistics(period, startDate, endDate);
            return Ok(data);
        }

        [HttpGet("statistics/ratings")]
        public IActionResult GetRatingStatistics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var data = _adminService.GetRatingStatistics(startDate, endDate);
            return Ok(data);
        }

        [HttpGet("statistics/usage")]
        public IActionResult GetUsageStatistics(
            [FromQuery] string period = "month",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var data = _adminService.GetUsageStatistics(period, startDate, endDate);
            return Ok(data);
        }
    }
}
