using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Booking;
using ServerSide.Exceptions;
using ServerSide.Models;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        //call iservice
        private readonly IBookingService service;

        public BookingController(IBookingService service)
        {
            this.service = service;
        }

        //get booking 
        //= 0 - booked
        //=-1 - canceled
        //= 1 - checked in
        //= 2 checked out
        //by date and status
        //for home - just check the date after, before -> check by fe because cannot be booked
        [HttpGet("date/{date}/status/{status}")]
        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date,byte status)
        {
            return service.GetBookingByDateAndStatus(date,status);
        }

        

        [HttpPost]
        public IActionResult CreateBooking([FromBody]CreateBookingDTO createBookingDTO)
        {

            try
            {
                service.CreateBooking(createBookingDTO);
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


        //detail booking
        [HttpGet("{id}")]
        public BookingDetailDTO GetDetailBookingById(int id)
        {
            return service.GetDetailBookingById(id);
        }
    } 
}
