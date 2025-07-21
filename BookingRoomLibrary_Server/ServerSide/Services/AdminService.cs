using System;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<BookingStatisticsDTO> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var data = await _bookingRepository.GetBookingStatistics(period, startDate, endDate);
                return new BookingStatisticsDTO
                {
                    Dates = data.Select(x => (string)((dynamic)x).Date).ToList(),
                    Counts = data.Select(x => (int)((dynamic)x).Count).ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetBookingStatistics: {ex.Message}");
                throw;
            }
        }

        public async Task<RatingStatisticsDTO> GetRatingStatistics(DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var data = await _bookingRepository.GetRatingStatistics(startDate, endDate);
                var ratingCounts = new int[5]; // index 0 = 1 star, index 4 = 5 stars

                foreach (var item in data)
                {
                    if (item.RatingValue >= 1 && item.RatingValue <= 5)
                    {
                        ratingCounts[item.RatingValue - 1] = item.Count;
                    }
                }

                return new RatingStatisticsDTO
                {
                    Ratings = ratingCounts.ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetRatingStatistics: {ex.Message}");
                throw;
            }
        }

        public async Task<UsageStatisticsDTO> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var data = await _bookingRepository.GetUsageStatistics(period, startDate, endDate);
                return new UsageStatisticsDTO
                {
                    Dates = data.Select(x => (string)((dynamic)x).Date).ToList(),
                    Durations = data.Select(x => (double)((dynamic)x).Duration).ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUsageStatistics: {ex.Message}");
                throw;
            }
        }
    }

    public interface IAdminService
    {
        Task<BookingStatisticsDTO> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate);
        Task<RatingStatisticsDTO> GetRatingStatistics(DateTime? startDate, DateTime? endDate);
        Task<UsageStatisticsDTO> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate);
    }
}