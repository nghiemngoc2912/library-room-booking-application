
using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

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

    public IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date, byte status)
    {
        return context.Bookings
            .Where(x => x.BookingDate == date && x.Status == status)
            .ToList();
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
