using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.User;
using ServerSide.Filters;
using ServerSide.Models;
using ServerSide.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ServerSide.Controllers
{
    [RoleFilter((int)Roles.Student, (int)Roles.Staff, (int)Roles.Admin)]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;
        private readonly IAccountService _accountService;

        public UserController(IUserService userService, IAccountService accountService)
        {
            this.userService = userService;
            _accountService = accountService;
        }

        // GET: api/user/search?code=SE123
        [HttpGet("search")]
        public IEnumerable<UserBookingDTO> SearchUserByCode([FromQuery] string code)
        {
            return userService.SearchUserByCode(code);
        }

        // GET: api/user/5/reputation
        [HttpGet("{userId}/reputation")]
        public async Task<IActionResult> GetReputation(int userId)
        {
            var result = await userService.GetUserReputationAsync(userId);
            if (result == null) return NotFound();
            return Ok(result);
        }
        [HttpGet("students")]
        public IActionResult GetStudentLists([FromQuery] string? keyword,[FromQuery] int page = 1)
        {
            var result = userService.GetAllStudents(keyword, page, Pagination.DefaultPageSize);
            return Ok(result);
        }
    }
}