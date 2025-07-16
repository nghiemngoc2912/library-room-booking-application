using ServerSide.DTOs.Admin;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class AdminService : IAdminService
    {
        private readonly IBookingRepository _bookingRepository;

        public AdminService(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public BookingStatisticsDTO GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            var data = _bookingRepository.GetBookingStatistics(period, startDate, endDate).Result;

            return new BookingStatisticsDTO
            {
                Dates = data.Select(x => (string)((dynamic)x).Date).ToList(),
                Counts = data.Select(x => (int)((dynamic)x).Count).ToList()
            };
        }

        //public RatingStatisticsDTO GetRatingStatistics(DateTime? startDate, DateTime? endDate)
        //{
        //    var data = _repository.GetRatingStatistics(startDate, endDate).Result;

        //    return new RatingStatisticsDTO
        //    {
        //        Ratings = data.Select(x => (int)((dynamic)x).Count).ToList()
        //    };
        //}

        public UsageStatisticsDTO GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            var data = _bookingRepository.GetUsageStatistics(period, startDate, endDate).Result;

            return new UsageStatisticsDTO
            {
                Dates = data.Select(x => (string)((dynamic)x).Date).ToList(),
                Durations = data.Select(x => (double)((dynamic)x).Duration).ToList()
            };
        }
    }

    public interface IAdminService
    {
        BookingStatisticsDTO GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate);
        //RatingStatisticsDTO GetRatingStatistics(DateTime? startDate, DateTime? endDate);
        UsageStatisticsDTO GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate);
    }
}
