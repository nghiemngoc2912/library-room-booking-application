using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Booking;
using ServerSide.Exceptions;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("date/{date}/status/{status}")]
        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            return _bookingService.GetBookingByDateAndStatus(date, status);
        }

        

        [HttpPost]
        public IActionResult CreateBooking([FromBody]CreateBookingDTO createBookingDTO)
        {

            try
            {
                _bookingService.CreateBooking(createBookingDTO);
                return Ok("Booking created successfully");
            }
            catch (BookingPolicyViolationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("user/{userId}/history")]
        public async Task<IActionResult> GetBookingHistory(
            int userId, DateTime? from = null, DateTime? to = null,
            int page = 1, int pageSize = 5)
        {
            var (total, data) = await _bookingService.GetBookingHistoryAsync(userId, from, to, page, pageSize);
            return Ok(new { total, data });
        }

        [HttpPost("{bookingId}/rate")]
        public async Task<IActionResult> RateRoom(int bookingId, [FromBody] CreateRatingDTO dto)
        {
            try
            {
                await _bookingService.AddRatingAsync(bookingId, dto);
                return Ok(new { message = "Rating submitted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
    }
}
