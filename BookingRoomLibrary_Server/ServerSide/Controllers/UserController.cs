using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.User;
using ServerSide.Models;
using ServerSide.Services;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;

        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        [HttpGet("Search")]
        public IEnumerable<UserBookingDTO> SearchUserByCode([FromQuery] string code)
        {
            return userService.SearchUserByCode(code);
        }
        [HttpGet("students")]
        public IActionResult GetStudentLists([FromQuery] string? keyword,[FromQuery] int page = 1)
        {
            var result = userService.GetAllStudents(keyword, page, Pagination.DefaultPageSize);
            return Ok(result);
        }
    }
}
