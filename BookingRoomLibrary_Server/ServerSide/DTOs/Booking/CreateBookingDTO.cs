using ServerSide.Models;

namespace ServerSide.DTOs.Booking
{
    public class CreateBookingDTO
    {
        public DateOnly BookingDate { get; set; }
        public int RoomId { get; set; }
        public int SlotId { get; set; }
        public string Reason { get; set; }
        public IEnumerable<string> StudentList { get; set; }
    }
}
