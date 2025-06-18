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

        Slot ISlotService.GetById(int id)
        {
            return slotRepository.GetById(id);
        }
    }
    public interface ISlotService
    {
        IEnumerable<Slot> GetAll();
        Slot GetById(int id);
    }
}
