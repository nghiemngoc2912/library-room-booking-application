using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class SlotService:ISlotService
    {
        private readonly ISlotRepository slotRepository;

        public SlotService(ISlotRepository slotRepository)
        {
            this.slotRepository = slotRepository;
        }

        public IEnumerable<Slot> GetAll()
        {
            return slotRepository.GetAll();
        }
    }
    public interface ISlotService
    {
        IEnumerable<Slot> GetAll();
    }
}
