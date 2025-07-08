using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using System.Collections.Generic;
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
    }
}
