using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using System.Globalization;

namespace ServerSide.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public AdminRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task<List<object>> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            var bookings = await _context.Bookings
                .Where(b => b.Status == 0)
                .ToListAsync();

            if (startDate.HasValue)
            {
                var start = DateOnly.FromDateTime(startDate.Value);
                bookings = bookings.Where(b => b.BookingDate >= start).ToList();
            }

            if (endDate.HasValue)
            {
                var end = DateOnly.FromDateTime(endDate.Value);
                bookings = bookings.Where(b => b.BookingDate <= end).ToList();
            }


            var grouped = bookings
                .GroupBy(b =>
                {
                    return period switch
                    {
                        "week" => b.BookingDate.ToDateTime(TimeOnly.MinValue).ToString("yyyy-") +
                                  System.Globalization.CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(
                                      b.BookingDate.ToDateTime(TimeOnly.MinValue),
                                      System.Globalization.CalendarWeekRule.FirstDay,
                                      DayOfWeek.Monday
                                  ).ToString("D2"),
                        "year" => b.BookingDate.ToString("yyyy"),
                        _ => b.BookingDate.ToString("yyyy-MM")
                    };
                })
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(x => x.Date)
                .ToList<object>();

            return grouped;
        }


        public async Task<List<object>> GetRatingStatistics(DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Ratings.GroupBy(r => r.RatingValue);

            if (startDate.HasValue)
            {
                query = query.Where(g => g.Any(r => r.CreatedDate >= startDate));
            }

            if (endDate.HasValue)
            {
                query = query.Where(g => g.Any(r => r.CreatedDate <= endDate));
            }

            return await query
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .OrderBy(x => x.Rating)
                .ToListAsync<object>();
        }

        public async Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            // Lấy dữ liệu thô từ DB
            var bookings = await _context.Bookings
                .Where(b => b.CheckInAt.HasValue && b.CheckOutAt.HasValue)
                .ToListAsync();

            // Lọc theo ngày nếu có
            if (startDate.HasValue)
            {
                bookings = bookings.Where(b => b.CheckInAt.Value.Date >= startDate.Value.Date).ToList();
            }

            if (endDate.HasValue)
            {
                bookings = bookings.Where(b => b.CheckInAt.Value.Date <= endDate.Value.Date).ToList();
            }

            // Chuyển và group theo period
            var grouped = bookings
                .Select(b => new
                {
                    Date = period switch
                    {
                        "week" => ISOWeek.GetYear(b.CheckInAt.Value) + "-" + ISOWeek.GetWeekOfYear(b.CheckInAt.Value),
                        "year" => b.CheckInAt.Value.ToString("yyyy"),
                        _ => b.CheckInAt.Value.ToString("yyyy-MM")
                    },
                    Duration = (b.CheckOutAt.Value - b.CheckInAt.Value).TotalHours
                })
                .GroupBy(x => x.Date)
                .Select(g => new { Date = g.Key, Duration = g.Average(x => x.Duration) })
                .OrderBy(x => x.Date)
                .Cast<object>()
                .ToList();

            return grouped;
        }

    }

    public interface IAdminRepository
    {
        Task<List<object>> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate);
        Task<List<object>> GetRatingStatistics(DateTime? startDate, DateTime? endDate);
        Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate);
    }
}
