using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Booking;
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

        //create booking
        //check date
        //check student reputation
        //check booking time in a day
        //check booking time in 7 days



        //change status
    }
}
