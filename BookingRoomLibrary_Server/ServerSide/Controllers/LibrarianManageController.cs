// ServerSide/Controllers/LibrarianManageController.cs
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs;
using ServerSide.DTOs.Account;
using ServerSide.Services;
using ServerSide.Constants;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LibrarianManageController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public LibrarianManageController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLibrarians(
            [FromQuery] string? keyword,
            [FromQuery] byte? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = Pagination.DefaultPageSize)
        {
            try
            {
                var data = _accountService.GetAllLibrarians(keyword, status, page, pageSize);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching librarians",
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLibrarianById(int id)
        {
            try
            {
                var librarian = await _accountService.GetLibrarianByIdAsync(id);
                if (librarian == null)
                    return NotFound(new { message = "Librarian not found" });
                return Ok(librarian);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching librarian details",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateLibrarian([FromBody] CreateAccountDTO dto)
        {
            try
            {
                var staff = await _accountService.CreateLibrarianAsync(dto);
                return CreatedAtAction(nameof(GetLibrarianById), new { id = staff.Id }, staff);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo nhân viên.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLibrarian(int id, [FromBody] CreateAccountDTO dto)
        {
            try
            {
                var updatedStaff = await _accountService.UpdateLibrarianAsync(id, dto);
                return Ok(updatedStaff);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the staff member.", error = ex.Message });
            }
        }

        [HttpPut("status")]
        public async Task<IActionResult> UpdateLibrarianStatus([FromBody] UpdateAccountStatusDTO dto)
        {
            try
            {
                await _accountService.UpdateLibrarianStatusAsync(dto);
                return Ok(new { message = "Librarian status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while updating librarian status",
                    error = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLibrarian(int id)
        {
            try
            {
                await _accountService.DeleteLibrarianAsync(id);
                return Ok(new { message = "Librarian deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting librarian",
                    error = ex.Message
                });
            }
        }
    }
}