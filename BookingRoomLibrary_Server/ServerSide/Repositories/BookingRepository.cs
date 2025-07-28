using Glimpse.Core.Extensibility;
using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.DTOs.Admin;
using ServerSide.DTOs.Rating;
using ServerSide.Models;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace ServerSide.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly LibraryRoomBookingContext context;

        public BookingRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        void IBookingRepository.Add(Booking booking)
        {
            context.Bookings.Add(booking);
            context.SaveChanges();
        }

        public void Add(Booking booking)
        {
            context.Bookings.Add(booking);
            context.SaveChanges();
        }

        public IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            return context.Bookings
                .Where(x => x.BookingDate == date && x.Status == status)
                .ToList();
        }

        public int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate)
        {
            return context.Bookings
                .Where(b =>
                    b.BookingDate >= fromDate &&
                    b.BookingDate <= toDate &&
                    b.Students.Any(s => s.Id == user.Id) &&
                    b.Status!=(byte)BookingRoomStatus.CanceledForMaintainance
                    )
                .Count();
        }
        public Booking GetBookingById(int id)
        {
            return context.Bookings
                .Include(b => b.Students)
                .Include(b=>b.Slot)
                .FirstOrDefault(b=>b.Id==id);
        }

        void IBookingRepository.UpdateBooking(Booking booking)
        {
            context.Bookings.Update(booking);
            context.SaveChanges();
        }


        public async Task<List<Booking>> GetBookingsByUser(int userId, DateOnly? from, DateOnly? to, int page, int pageSize)
        {
            var query = context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Slot)
                .Include(b => b.Ratings)
                .Include(b => b.Students)
                .Where(b => b.CreatedBy == userId); 

            if (from.HasValue)
                query = query.Where(b => b.BookingDate >= from.Value);
            if (to.HasValue)
                query = query.Where(b => b.BookingDate <= to.Value);

            return await query
                .OrderByDescending(b => b.BookingDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }


        public async Task<int> CountBookingsByUser(int userId, DateOnly? from, DateOnly? to)
        {
            var query = context.Bookings
                .Where(b => b.CreatedBy == userId); // Lọc theo CreatedBy

            if (from.HasValue)
                query = query.Where(b => b.BookingDate >= from.Value);
            if (to.HasValue)
                query = query.Where(b => b.BookingDate <= to.Value);

            return await query.CountAsync();
        }

        public async Task<List<object>> GetBookingStatistics(DateTime? startDate, DateTime? endDate)
        {
            try
            {
                Console.WriteLine($"Fetching booking statistics with startDate: {startDate}, endDate: {endDate}");
                var query = context.Bookings.AsQueryable(); // bỏ điều kiện lọc status


                if (startDate.HasValue)
                {
                    var start = DateOnly.FromDateTime(startDate.Value);
                    Console.WriteLine($"Applying startDate filter: {start}");
                    query = query.Where(b => b.BookingDate >= start);
                }

                if (endDate.HasValue)
                {
                    var end = DateOnly.FromDateTime(endDate.Value);
                    Console.WriteLine($"Applying endDate filter: {end}");
                    query = query.Where(b => b.BookingDate <= end);
                }

                var groupedRaw = await query
                    .GroupBy(b => b.BookingDate)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                Console.WriteLine($"Query result: {System.Text.Json.JsonSerializer.Serialize(groupedRaw)}");

                var result = groupedRaw
                    .Select(g => new
                    {
                        Date = g.Date.ToString("yyyy-MM-dd"),
                        Count = g.Count
                    })
                    .ToList<object>();

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetBookingStatistics: {ex.Message}, StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var bookings = await context.Bookings
                    .Where(b => b.CheckInAt.HasValue && b.CheckOutAt.HasValue)
                    .ToListAsync();

                if (startDate.HasValue)
                {
                    bookings = bookings.Where(b => b.CheckInAt.Value.Date >= startDate.Value.Date).ToList();
                }

                if (endDate.HasValue)
                {
                    bookings = bookings.Where(b => b.CheckInAt.Value.Date <= endDate.Value.Date).ToList();
                }

                if (!bookings.Any())
                {
                    return new List<object>(); // Return empty list if no data
                }

                var grouped = bookings
                    .Select(b => new
                    {
                        Date = period switch
                        {
                            "week" => ISOWeek.GetYear(b.CheckInAt.Value) + "-" + ISOWeek.GetWeekOfYear(b.CheckInAt.Value).ToString("D2"),
                            "year" => b.CheckInAt.Value.ToString("yyyy"),
                            _ => b.CheckInAt.Value.ToString("yyyy-MM")
                        },
                        Duration = (b.CheckOutAt.Value - b.CheckInAt.Value).TotalHours
                    })
                    .GroupBy(x => x.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Duration = g.Any() ? g.Average(x => x.Duration) : 0.0
                    })
                    .OrderBy(x => x.Date)
                    .ToList<object>();

                return grouped;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUsageStatistics: {ex.Message}");
                throw; // Or handle the error as needed
            }
        }

    public async Task<IEnumerable<Booking>> GetExpiredBooking()
        {
            var now = DateTime.Now;

            return context.Bookings
                .Include(b => b.Slot)
                .Where(b => b.Status == (byte)BookingRoomStatus.Booked && b.CheckInAt == null)
                .AsEnumerable() // Chuyển sang client-side LINQ
                .Where(b =>
                    b.BookingDate.ToDateTime(b.Slot.FromTime).AddMinutes(15) < now
                )
                .ToList();
        }

        public async Task<List<ServerSide.DTOs.Admin.RatingGroupResult>> GetRatingStatistics(DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var query = context.Ratings.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(r => r.CreatedDate >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(r => r.CreatedDate <= endDate.Value);

                var result = await query
                    .GroupBy(r => r.RatingValue)
                    .Select(g => new ServerSide.DTOs.Admin.RatingGroupResult
                    {
                        RatingValue = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetRatingStatistics: {ex.Message}");
                throw;
            }
        }
        public async Task<List<Booking>> GetBookingsToRemindAsync()
        {
            return await context.Bookings
                .Include(b => b.Slot)
                .Include(b => b.CreatedByNavigation).ThenInclude(u => u.Account)
                .Where(b => (b.ReminderSent == null || b.ReminderSent == false)
                            && b.Status == (byte)BookingRoomStatus.Booked)
                .ToListAsync();

        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }

    }

    public interface IBookingRepository
    {
        Task<List<Booking>> GetBookingsByUser(int userId, DateOnly? from, DateOnly? to, int page, int pageSize);
        void Add(Booking booking);
        IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date, byte status);
        int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate);
        Task<int> CountBookingsByUser(int userId, DateOnly? from, DateOnly? to);
        Booking GetBookingById(int id);
        void UpdateBooking(Booking booking);
        Task<List<object>> GetBookingStatistics(DateTime? startDate, DateTime? endDate);
        Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate);
        Task<List<ServerSide.DTOs.Admin.RatingGroupResult>> GetRatingStatistics(DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<Booking>> GetExpiredBooking();
        Task SaveChangesAsync();
        Task<List<Booking>> GetBookingsToRemindAsync();
    }
}
