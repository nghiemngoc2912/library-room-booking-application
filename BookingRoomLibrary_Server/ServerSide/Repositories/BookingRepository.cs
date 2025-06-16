
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class BookingRepository:IBookingRepository
    {
        //remember DI in Program.cs
        private readonly LibraryRoomBookingContext context;

        public BookingRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        IEnumerable<Booking> IBookingRepository.GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            return context.Bookings.Where(x=>x.BookingDate == date&&x.Status==status).ToList();
        }
    }
    public interface IBookingRepository
    {
        IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date,byte status);
    }
}
