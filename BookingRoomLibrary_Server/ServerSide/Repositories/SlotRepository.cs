using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class SlotRepository: ISlotRepository
    {
        private readonly LibraryRoomBookingContext context;

        public SlotRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        public IEnumerable<Slot> GetAll()
        {
            return context.Slots.ToList();
        }

        Slot ISlotRepository.GetById(int id)
        {
            return context.Slots.Find(id);
        }
    }
    public interface ISlotRepository
    {
        IEnumerable<Slot> GetAll();
        Slot GetById(int id);
    }
}
