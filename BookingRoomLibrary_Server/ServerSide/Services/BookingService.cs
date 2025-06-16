using ServerSide.DTOs.Booking;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class BookingService:IBookingService
    {
        //remember DI in Program.cs
        private readonly IBookingRepository repository;

        public BookingService(IBookingRepository repository)
        {
            this.repository = repository;
        }

        public IEnumerable<HomeBookingDTO> GetBookingByDate(DateOnly date)
        {

            throw new NotImplementedException();
        }
    }
    public interface IBookingService
    {
        IEnumerable<HomeBookingDTO> GetBookingByDate(DateOnly date);
    }
}
