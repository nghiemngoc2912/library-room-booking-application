namespace ServerSide.DTOs.Admin
{
    public class BookingStatisticsDTO
    {
        public List<string> Dates { get; set; } = new();
        public List<int> Counts { get; set; } = new();
    }

    public class RatingStatisticsDTO
    {
        public List<int> Ratings { get; set; }
    }

    public class RatingGroupResult
    {
        public int RatingValue { get; set; }
        public int Count { get; set; }
    }

    public class UsageStatisticsDTO
    {
        public List<string> Dates { get; set; }
        public List<double> Durations { get; set; }
    }


}
