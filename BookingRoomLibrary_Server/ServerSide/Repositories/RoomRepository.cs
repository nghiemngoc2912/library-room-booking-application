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

        Room IRoomRepository.GetById(int id)
        {
            return context.Rooms.Find(id);
        }
    }
    public interface IRoomRepository
    {
        IEnumerable<Room> GetAll();
        Room GetById(int id);
    }
}
