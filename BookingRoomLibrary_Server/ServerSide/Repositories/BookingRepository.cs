using ServerSide.Services;

namespace ServerSide.Repositories
{
    public class BookingRepository:IBookingRepository
    {
        //remember DI in Program.cs
        //call the interface
        IBookingService service;


    }
    public interface IBookingRepository
    {
        
    }
}
