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

        public IEnumerable<RoomLibrarian> GetAllRoomsForStaffManagement()
        {
            return roomRepository.GetAll().Select(r => new RoomLibrarian(r)).ToList();
        }

        CreateBookingRoomDTO IRoomService.GetRoomByIdForBooking(int id)
        {
            return new CreateBookingRoomDTO(roomRepository.GetById(id));
        }
    }
    public interface IRoomService
    {
        IEnumerable<HomeRoomDTO> GetAllRoomsForHome();
        IEnumerable<RoomLibrarian> GetAllRoomsForStaffManagement();
        CreateBookingRoomDTO GetRoomByIdForBooking(int id);
    }
}
