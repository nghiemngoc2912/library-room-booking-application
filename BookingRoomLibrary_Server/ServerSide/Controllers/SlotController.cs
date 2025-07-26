using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.Filters;
using ServerSide.Models;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [RoleFilter((int)Roles.Student, (int)Roles.Staff, (int)Roles.Admin)]
    [Route("api/[controller]")]
    [ApiController]
    public class SlotController : ControllerBase
    {
        private readonly ISlotService slotService;

        public SlotController(ISlotService slotService)
        {
            this.slotService = slotService;
        }

        [HttpGet]
        public IEnumerable<Slot> GetAll()
        {
            return slotService.GetAll();
        }

        [HttpGet("{id}")]
        public Slot GetById(int id)
        {
            return slotService.GetById(id);
        }

        [HttpGet("filter")]
        public IActionResult GetFilteredSlots([FromQuery] string search = null, [FromQuery] int? status = null)
        {
            try
            {
                var slots = slotService.GetFilteredSlots(search, status);
                return Ok(slots.Select(s => new
                {
                    s.Id,
                    s.Order,
                    FromTime = s.FromTime,
                    ToTime = s.ToTime,
                    Status = (s.Status == 254) ? -2 : (s.Status == 255) ? -1 : s.Status
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [RoleFilter((int)Roles.Staff,(int)Roles.Admin)]
        [HttpGet("update/{id}")]
        public IActionResult GetSlotByIdForUpdate(int id)
        {
            try
            {
                var slot = slotService.GetSlotByIdForUpdate(id);
                if (slot == null)
                {
                    return NotFound("Slot not found.");
                }
                return Ok(new
                {
                    slot.Id,
                    slot.Order,
                    FromTime = slot.FromTime,
                    ToTime = slot.ToTime,
                    Status = (slot.Status == 254) ? -2 : (slot.Status == 255) ? -1 : slot.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpPost]
        public IActionResult CreateSlot([FromBody] SlotDTO slotDTO)
        {
            try
            {
                var created = slotService.CreateSlot(slotDTO);
                if (!created)
                {
                    return StatusCode(500, "Failed to create slot.");
                }
                return Ok("Slot created successfully.");
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
        [HttpPut("update/{id}")]
        public IActionResult UpdateSlot(int id, [FromBody] SlotDTO slotDTO)
        {
            if (id != slotDTO.Id)
            {
                return BadRequest("Slot ID mismatch.");
            }

            try
            {
                var updated = slotService.UpdateSlot(slotDTO);
                if (!updated)
                {
                    return NotFound("Slot not found.");
                }
                return Ok("Slot updated successfully.");
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
        [HttpPut("deactivate/{id}")]
        public IActionResult DeactivateSlot(int id)
        {
            try
            {
                var deactivated = slotService.DeactivateSlot(id);
                if (!deactivated)
                {
                    return BadRequest("Slot not found or not in Active status.");
                }
                return Ok("Slot deactivated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
        [HttpPut("activate/{id}")]
        public IActionResult ActivateSlot(int id)
        {
            try
            {
                var activated = slotService.ActivateSlot(id);
                if (!activated)
                {
                    return BadRequest("Slot not found or not in Inactive status.");
                }
                return Ok("Slot activated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}