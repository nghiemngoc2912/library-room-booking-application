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

        public bool Create(Room room)
        {
            if (room == null)
            {
                return false;
            }

            context.Rooms.Add(room);
            context.SaveChanges();
            return true;
        }

        public IEnumerable<Room> GetAll()
        {
            return context.Rooms.ToList();
        }

        public Room GetById(int id)
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

        public void Save()
        {
            context.SaveChanges();  
        }
    }

    public interface IRoomRepository
    {
        bool Create(Room room);
        IEnumerable<Room> GetAll();
        Room GetById(int id);
        bool Update(Room room);
        void Save();
    }
}