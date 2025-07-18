﻿using Microsoft.EntityFrameworkCore;
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
                    b.Students.Any(s => s.Id == user.Id))
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
            var bookingIds = await context.Bookings
                .Where(b => b.Students.Any(s => s.Id == userId))
                .Select(b => b.Id)
                .ToListAsync();

            var query = context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Slot)
                .Include(b => b.Ratings)
                .Include(b => b.Students)
                .Where(b => bookingIds.Contains(b.Id));

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
                .Where(b => b.Students.Any(s => s.Id == userId));

            if (from.HasValue)
                query = query.Where(b => b.BookingDate >= from.Value);
            if (to.HasValue)
                query = query.Where(b => b.BookingDate <= to.Value);

            return await query.CountAsync();
        }

        public async Task<List<object>> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            var bookings = await context.Bookings
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

        public async Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate)
        {
            // Lấy dữ liệu thô từ DB
            var bookings = await context.Bookings
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

        public async Task<IEnumerable<Booking>> GetExpiredBooking()
        {
            var now = DateTime.Now;

            return context.Bookings
                .Include(b => b.Slot)
                .Where(b => b.Status == 0 && b.CheckInAt == null)
                .AsEnumerable() // Chuyển sang client-side LINQ
                .Where(b =>
                    b.BookingDate.ToDateTime(b.Slot.FromTime).AddMinutes(15) < now
                )
                .ToList();
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
        Task<List<object>> GetBookingStatistics(string period, DateTime? startDate, DateTime? endDate);
        Task<List<object>> GetUsageStatistics(string period, DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<Booking>> GetExpiredBooking();
    }
}
