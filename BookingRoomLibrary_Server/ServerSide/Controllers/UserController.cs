﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.User;
using ServerSide.Models;
using ServerSide.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

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