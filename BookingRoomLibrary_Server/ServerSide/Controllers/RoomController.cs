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

        [HttpPost]
        public IActionResult CreateRoom([FromBody] CreateRoomDTO createRoomDTO)
        {
            try
            {
                var created = roomService.CreateRoom(createRoomDTO);
                if (!created)
                {
                    return StatusCode(500, "Failed to create room.");
                }
                return Ok("Room created successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet]
        public IEnumerable<HomeRoomDTO> GetAll()
        {
            return roomService.GetAllRoomsForHome();
        }

        [HttpGet("room_librarian")]
        public IEnumerable<RoomLibrarian> GetAllForLibrarian()
        {
            return roomService.GetAllRoomsForStaffManagement();
        }

        [HttpGet("room_librarian/filter")]
        public IActionResult GetFilteredRoomsForLibrarian([FromQuery] string search = null, [FromQuery] int? status = null)
        {
            try
            {
                var rooms = roomService.GetFilteredRoomsForLibrarian(search, status);
                return Ok(rooms.Select(r => new
                {
                    r.Id,
                    r.RoomName,
                    r.Capacity,
                    Status = r.StatusAsInt
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
        public CreateBookingRoomDTO GetById(int id)
        {
            return roomService.GetRoomByIdForBooking(id);
        }

        [HttpGet("update_room/{id}")]
        public IActionResult GetByIdForUpdate(int id)
        {
            try
            {
                var room = roomService.GetRoomByIdForUpdate(id);
                if (room == null)
                {
                    return NotFound("Room not found.");
                }
                return Ok(new
                {
                    room.Id,
                    room.RoomName,
                    room.Capacity,
                    Status = (room.Status == 254) ? -2 : (room.Status == 255) ? -1 : room.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("update_room/{id}")]
        public IActionResult UpdateRoom(int id, [FromBody] UpdateRoomDTO updateRoomDTO)
        {
            if (id != updateRoomDTO.Id)
            {
                return BadRequest("Room ID mismatch.");
            }

            try
            {
                var updated = roomService.UpdateRoom(updateRoomDTO);
                if (!updated)
                {
                    return NotFound("Room not found.");
                }
                return Ok("Room updated successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}