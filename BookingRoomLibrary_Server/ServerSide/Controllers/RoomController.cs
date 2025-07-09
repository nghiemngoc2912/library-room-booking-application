using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Room;
using ServerSide.Models;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService roomService;

        public RoomController(IRoomService roomService)
        {
            this.roomService = roomService;
        }

        [HttpGet]
        public IEnumerable<HomeRoomDTO> GetAll()
        {
            return roomService.GetAllRoomsForHome();
        }

        [HttpGet("/room_librarian")]
        public IEnumerable<RoomLibrarian> GetAllForLibrarian()
        {
            return roomService.GetAllRoomsForStaffManagement();
        }

        [HttpGet("{id}")]
        public CreateBookingRoomDTO GetById(int id)
        {
            return roomService.GetRoomByIdForBooking(id);
        }
    }
}
