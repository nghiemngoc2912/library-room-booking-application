using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class RatingRepository : IRatingRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public RatingRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Rating rating)
        {
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();
        }

        public async Task<Rating?> GetByBookingAndUserAsync(int bookingId, int studentId)
        {
            return await _context.Ratings
                .FirstOrDefaultAsync(r => r.BookingId == bookingId && r.StudentId == studentId);
        }
    }

    public interface IRatingRepository
    {
        Task CreateAsync(Rating rating);
        Task<Rating?> GetByBookingAndUserAsync(int bookingId, int studentId);
    }
}
