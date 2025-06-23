using ServerSide.DTOs.Room;
using ServerSide.Models;
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

        public IEnumerable<HomeRoomDTO> GetAllRoomsForHome()
        {
            return roomRepository.GetAll().Select(r => new HomeRoomDTO(r)).ToList();
        }

        CreateBookingRoomDTO IRoomService.GetRoomByIdForBooking(int id)
        {
            return new CreateBookingRoomDTO(roomRepository.GetById(id));
        }
    }
    public interface IRoomService
    {
        IEnumerable<HomeRoomDTO> GetAllRoomsForHome();
        CreateBookingRoomDTO GetRoomByIdForBooking(int id);
    }
}
