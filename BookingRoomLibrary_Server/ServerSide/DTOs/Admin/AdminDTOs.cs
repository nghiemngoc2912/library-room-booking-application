namespace ServerSide.DTOs.Admin
{
    public class BookingStatisticsDTO
    {
        public List<string> Dates { get; set; } = new();
        public List<int> Counts { get; set; } = new();
    }

    public class RatingStatisticsDTO
    {
        // Represents the number of ratings for each value (e.g., 1 to 5 stars)
        public List<int> Ratings { get; set; } = new();
    }

    public class UsageStatisticsDTO
    {
        public List<string> Dates { get; set; } = new();
        public List<double> Durations { get; set; } = new(); // Durations in hours
    }
}
