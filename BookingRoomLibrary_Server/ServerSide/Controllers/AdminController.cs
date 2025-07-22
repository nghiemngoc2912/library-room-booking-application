using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.Filters;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [RoleFilter((int)Roles.Admin)]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IRoomService _roomService;
        private readonly ISlotService _slotService;

        public AdminController(IAdminService adminService, IRoomService roomService, ISlotService slotService)
        {
            _adminService = adminService;
            _roomService = roomService;
            _slotService = slotService;
        }

        [HttpGet("statistics/bookings")]
        public IActionResult GetBookingStatistics(
            [FromQuery] string period = "month",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var data = _adminService.GetBookingStatistics(period, startDate, endDate);
            return Ok(data);
        }

        [HttpGet("statistics/ratings")]
        public IActionResult GetRatingStatistics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            //var data = _adminService.GetRatingStatistics(startDate, endDate);
            return Ok(null);
        }

        [HttpGet("statistics/usage")]
        public IActionResult GetUsageStatistics(
            [FromQuery] string period = "month",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var data = _adminService.GetUsageStatistics(period, startDate, endDate);
            return Ok(data);
        }

        [HttpGet("pending_rooms")]
        public IActionResult GetPendingRooms([FromQuery] string search = null)
        {
            try
            {
                var rooms = _roomService.GetPendingRooms(search);
                return Ok(rooms.Select(r => new
                {
                    r.Id,
                    r.RoomName,
                    r.Capacity,
                    Status = r.Status == 0 ? "Pending" : r.Status.ToString()
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("pending_rooms/{id}")]
        public IActionResult GetPendingRoomById(int id)
        {
            try
            {
                var room = _roomService.GetPendingRoomById(id);
                if (room == null)
                {
                    return NotFound("Room not found or not in Pending status.");
                }
                return Ok(new
                {
                    room.Id,
                    room.RoomName,
                    room.Capacity,
                    Status = room.Status == 0 ? "Pending" : room.Status.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("pending_rooms/accept/{id}")]
        public IActionResult AcceptRoom(int id)
        {
            try
            {
                var accepted = _roomService.AcceptRoom(id);
                if (!accepted)
                {
                    return BadRequest("Room not found or not in Pending status.");
                }
                return Ok("Room accepted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("pending_rooms/reject/{id}")]
        public IActionResult RejectRoom(int id)
        {
            try
            {
                var rejected = _roomService.RejectRoom(id);
                if (!rejected)
                {
                    return BadRequest("Room not found or not in Pending status.");
                }
                return Ok("Room rejected and deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("pending_slots")]
        public IActionResult GetPendingSlots([FromQuery] string search = null)
        {
            try
            {
                var slots = _slotService.GetPendingSlots(search);
                return Ok(slots.Select(s => new
                {
                    s.Id,
                    s.Order,
                    FromTime = s.FromTime.ToString("HH:mm"),
                    ToTime = s.ToTime.ToString("HH:mm"),
                    Status = s.Status == 0 ? "Pending" : s.Status.ToString()
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("pending_slots/{id}")]
        public IActionResult GetPendingSlotById(int id)
        {
            try
            {
                var slot = _slotService.GetPendingSlotById(id);
                if (slot == null)
                {
                    return NotFound("Slot not found or not in Pending status.");
                }
                return Ok(new
                {
                    slot.Id,
                    slot.Order,
                    FromTime = slot.FromTime.ToString("HH:mm"),
                    ToTime = slot.ToTime.ToString("HH:mm"),
                    Status = slot.Status == 0 ? "Pending" : slot.Status.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("pending_slots/accept/{id}")]
        public IActionResult AcceptSlot(int id)
        {
            try
            {
                var accepted = _slotService.AcceptSlot(id);
                if (!accepted)
                {
                    return BadRequest("Slot not found or not in Pending status.");
                }
                return Ok("Slot accepted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("pending_slots/reject/{id}")]
        public IActionResult RejectSlot(int id)
        {
            try
            {
                var rejected = _slotService.RejectSlot(id);
                if (!rejected)
                {
                    return BadRequest("Slot not found or not in Pending status.");
                }
                return Ok("Slot rejected and deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}