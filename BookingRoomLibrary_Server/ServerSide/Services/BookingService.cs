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

        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            var listRaw = repository.GetBookingByDateAndStatus(date,status);
            var list = listRaw.Select(x=>new HomeBookingDTO(x)).ToList();
            return list;
        }
    }
    public interface IBookingService
    {
        IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date,byte status);
    }
}
