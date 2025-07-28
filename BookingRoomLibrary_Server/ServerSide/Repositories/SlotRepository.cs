using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class SlotRepository : ISlotRepository
    {
        private readonly LibraryRoomBookingContext context;

        public SlotRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        public bool Create(Slot slot)
        {
            if (slot == null)
            {
                return false;
            }

            context.Slots.Add(slot);
            context.SaveChanges();
            return true;
        }

        public IEnumerable<Slot> GetAll()
        {
            return context.Slots.ToList();
        }

        public Slot GetById(int id)
        {
            return context.Slots.Find(id);
        }

        public bool Update(Slot slot)
        {
            var existingSlot = context.Slots.Find(slot.Id);
            if (existingSlot == null)
            {
                return false;
            }

            existingSlot.Order = slot.Order;
            existingSlot.FromTime = slot.FromTime;
            existingSlot.ToTime = slot.ToTime;
            existingSlot.Status = slot.Status;

            context.Slots.Update(existingSlot);
            context.SaveChanges();
            return true;
        }
        public bool Delete(int id)
        {
            var slot = context.Slots.Find(id);
            if (slot == null)
            {
                return false;
            }

            context.Slots.Remove(slot);
            context.SaveChanges();
            return true;
        }
    }

    public interface ISlotRepository
    {
        bool Create(Slot slot);
        IEnumerable<Slot> GetAll();
        Slot GetById(int id);
        bool Update(Slot slot);
        bool Delete(int id);

    }
}