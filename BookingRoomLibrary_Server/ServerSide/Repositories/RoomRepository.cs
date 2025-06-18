using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly LibraryRoomBookingContext context;

        public RoomRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        public IEnumerable<Room> GetAll()
        {
            return context.Rooms.ToList();
        }
    }
    public interface IRoomRepository
    {
        IEnumerable<Room> GetAll();
    }
}
