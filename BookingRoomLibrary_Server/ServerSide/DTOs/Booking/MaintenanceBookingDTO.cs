namespace ServerSide.DTOs.Booking
{
    public class MaintenanceBookingDTO
    {
        public int RoomId { get; set; }
        public int SlotId { get; set; }
        public string? Reason { get; set; }
        public string? BookingDate { get; set; } // For single date
        public DateRangeDTO? DateRange { get; set; } // For range of dates
    }

    public class DateRangeDTO
    {
        public string From { get; set; }
        public string To { get; set; }
    }
}