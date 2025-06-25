using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.Room;
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

        //get all (with status also)
        //for home
        [HttpGet]
        public IEnumerable<HomeRoomDTO> GetAll()
        {
            return roomService.GetAllRoomsForHome();
        }
        [HttpGet("{id}")]
        public CreateBookingRoomDTO GetById(int id)
        {
            return roomService.GetRoomByIdForBooking(id);
        }
    }
}
