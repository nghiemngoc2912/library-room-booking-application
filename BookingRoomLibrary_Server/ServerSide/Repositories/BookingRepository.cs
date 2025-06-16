
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

    }
    public interface IBookingRepository
    {
        
    }
}
