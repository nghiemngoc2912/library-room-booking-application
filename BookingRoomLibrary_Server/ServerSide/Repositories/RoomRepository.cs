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

        public bool Update(Room room)
        {
            var existingRoom = context.Rooms.Find(room.Id);
            if (existingRoom == null)
            {
                return false;
            }

            existingRoom.RoomName = room.RoomName;
            existingRoom.Capacity = room.Capacity;
            existingRoom.Status = room.Status;

            context.Rooms.Update(existingRoom);
            context.SaveChanges();
            return true;
        }
    }
    public interface IRoomRepository
    {
        IEnumerable<Room> GetAll();
        Room GetById(int id);
        bool Update(Room room);
    }
}
