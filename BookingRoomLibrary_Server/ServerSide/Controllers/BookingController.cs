using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.Rating;
using ServerSide.Exceptions;
using ServerSide.Filters;
using ServerSide.Models;
using ServerSide.Services;


namespace ServerSide.Controllers
{
    [RoleFilter((int)Roles.Student, (int)Roles.Staff)]
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IRatingService _ratingService;

        public BookingController(IBookingService bookingService, IRatingService ratingService)
        {
            _bookingService = bookingService;
            _ratingService = ratingService; 
        }

        [HttpGet("date/{date}/status/{status}")]
        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            return _bookingService.GetBookingByDateAndStatus(date, status);
        }

        [HttpPost]
        public IActionResult CreateBooking([FromBody] CreateBookingDTO createBookingDTO)
        {
            try
            {
                //use session to retrieve booking user
                var userId_raw = HttpContext.Session.GetString("UserId");
                if (string.IsNullOrEmpty(userId_raw))
                {
                    return Unauthorized(new { message = "Not logged in" });
                }
                int userId = 0;
                try
                {
                    userId=int.Parse(userId_raw);
                }catch(Exception ex)
                {
                    return BadRequest(new { message = "Please check your login" });
                }
                _bookingService.CreateBooking(createBookingDTO,userId);
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

        [HttpGet("{id}")]
        public BookingDetailDTO GetDetailBookingById(int id)
        {
            return _bookingService.GetDetailBookingById(id);
        }

        [HttpPatch("{id}/checkin")]
        public IActionResult CheckinBooking(int id)
        {
            var (success, message, booking) = _bookingService.CheckIn(id);

            if (!success)
                return BadRequest(new { message });

            return Ok(new
            {
                message,
                bookingId = booking!.Id,
                checkinTime = booking.CheckInAt
            });
        }

        [HttpPatch("{id}/checkout")]
        public IActionResult CheckoutBooking(int id)
        {
            var (success, message, booking) = _bookingService.CheckOut(id); 

            if (!success)
                return BadRequest(new { message });

            return Ok(new
            {
                message,
                bookingId = booking!.Id,
                checkoutTime = booking.CheckOutAt 
            });
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
                await _ratingService.AddRatingAsync(bookingId, dto);
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
        [HttpPatch("cancel/{id}")]
        public IActionResult CancelBooking(int id) {
            try {
                _bookingService.CancelBooking(id);
                return Ok("Cancel Booking Successfully");
            }
            catch (BookingPolicyViolationException ex)
            {
                return BadRequest(ex.Message);
            }catch(Exception ex)
            {
                return StatusCode(500, "Something when wrong: "+ex.Message);
            }
            
        }
    }
}
