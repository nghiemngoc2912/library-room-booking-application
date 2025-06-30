using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService service;

        public UserController(IUserService service)
        {
            this.service = service;
        }

        [HttpGet("{userId}/reputation")]
        public async Task<IActionResult> GetReputation(int userId)
        {
            var result = await service.GetUserReputationAsync(userId);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}
