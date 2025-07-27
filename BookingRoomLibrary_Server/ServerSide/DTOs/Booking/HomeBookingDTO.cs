using ServerSide.Models;

namespace ServerSide.DTOs.Booking
{
    public class HomeBookingDTO
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int SlotId { get; set; }
        public byte Status { get; set; } 

        public HomeBookingDTO(ServerSide.Models.Booking booking)
        {
            this.Id = booking.Id;
            this.RoomId = booking.RoomId;
            this.SlotId = booking.SlotId;
            this.Status = booking.Status; 
        }
    }
}