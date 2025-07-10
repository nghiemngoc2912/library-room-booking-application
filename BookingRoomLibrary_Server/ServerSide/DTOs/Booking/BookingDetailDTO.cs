namespace ServerSide.DTOs.Booking
{
    public class BookingDetailDTO
    {
        public int Id { get; set; }
        public UserBookingDTO CreatedBy { get; set; }
        public DateOnly BookingDate { get; set; }

        public int RoomId { get; set; }

        public int SlotId { get; set; }
        public string Reason { get; set; }

        public byte Status { get; set; }
        public DateTime? CreatedDate { get; set; }

    public DateTime? CheckInAt { get; set; }

    public DateTime? CheckOutAt { get; set; }
        public List<UserBookingDTO> Students { get; set; }
    }
}
