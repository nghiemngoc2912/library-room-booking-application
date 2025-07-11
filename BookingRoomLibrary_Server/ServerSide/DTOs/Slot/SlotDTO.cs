namespace ServerSide.DTOs
{
    public class SlotDTO
    {
        public int Id { get; set; }
        public int Order { get; set; }
        public string FromTime { get; set; } // Format: HH:mm
        public string ToTime { get; set; }   // Format: HH:mm
        public byte Status { get; set; }

        public SlotDTO()
        {
        }

        public SlotDTO(ServerSide.Models.Slot slot)
        {
            if (slot != null)
            {
                Id = slot.Id;
                Order = slot.Order;
                FromTime = slot.FromTime.ToString("HH:mm");
                ToTime = slot.ToTime.ToString("HH:mm");
                Status = slot.Status;
            }
        }
    }
}