namespace ServerSide.Constants
{
    public class BookingRules
    {
        public int MaxIntervalDayToBook { get; set; }
        public int MaxWeeklyBookingDays { get; set; }
        public int MaxDailyBookingsPerStudent { get; set; }
        public int MinReputationToBook { get; set; }
        public int MinCapacityPercentage { get; set; }
        public int MaxTimeToCheckin { get; set; }
        public int MaxTimeToCheckout { get; set; }
        public int SubstractReputation { get; set; }
        public int TimeStart { get; set; }
        public int TimeEnd { get; set; }
        public int TimeJobInterval { get; set; }
        public int CancelTimeInterval { get; set;}
    }
}
