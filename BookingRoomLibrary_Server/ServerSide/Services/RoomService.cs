using ServerSide.DTOs.Room;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository roomRepository;

        public RoomService(IRoomRepository roomRepository)
        {
            this.roomRepository = roomRepository;
        }

        public IEnumerable<HomeRoomDTO> GetAll()
        {
            return roomRepository.GetAll().Select(r => new HomeRoomDTO(r)).ToList();
        }
    }
    public interface IRoomService
    {
        IEnumerable<HomeRoomDTO> GetAll();
    }
}
