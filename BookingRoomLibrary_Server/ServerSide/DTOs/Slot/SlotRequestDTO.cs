using ServerSide.Models;
using System;

namespace ServerSide.DTOs
{
    public class SlotRequestDTO
    {
        public int Id { get; set; }
        public int Order { get; set; }
        public TimeOnly FromTime { get; set; }
        public TimeOnly ToTime { get; set; }
        public byte Status { get; set; }

        public SlotRequestDTO() { }

        public SlotRequestDTO(Slot slot)
        {
            Id = slot.Id;
            Order = slot.Order;
            FromTime = slot.FromTime;
            ToTime = slot.ToTime;
            Status = slot.Status;
        }
    }
}