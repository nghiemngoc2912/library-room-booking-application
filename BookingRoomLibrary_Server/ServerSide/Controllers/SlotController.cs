using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Models;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SlotController : ControllerBase
    {
        private readonly ISlotService slotService;

        public SlotController(ISlotService slotService)
        {
            this.slotService = slotService;
        }

        //get all
        //for home
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


    }
}
