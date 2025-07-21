using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs.Rating;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _repo;
        private readonly LibraryRoomBookingContext _context;

        public RatingService(IRatingRepository repo, LibraryRoomBookingContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task AddRatingAsync(int bookingId, CreateRatingDTO dto)
        {
            var alreadyRated = await _context.Ratings
                .AnyAsync(r => r.BookingId == bookingId && r.StudentId == dto.StudentId);

            if (alreadyRated)
                throw new Exception("You have already rated this booking.");

            var joined = await _context.Bookings
                .Where(b => b.Id == bookingId)
                .SelectMany(b => b.Students)
                .AnyAsync(s => s.Id == dto.StudentId);

            if (!joined)
                throw new Exception("This student did not join the booking.");

            var rating = new Rating
            {
                BookingId = bookingId,
                StudentId = dto.StudentId,
                RatingValue = dto.RatingValue,
                Comment = dto.Comment,
                CreatedDate = DateTime.Now
            };

            await _repo.CreateAsync(rating);
        }

        public async Task<RatingDTO?> GetRatingByBookingAndUserAsync(int bookingId, int studentId)
        {
            var rating = await _repo.GetByBookingAndUserAsync(bookingId, studentId);
            if (rating == null) return null;

            return new RatingDTO
            {
                RatingValue = rating.RatingValue,
                Comment = rating.Comment
            };
        }
    }

    public interface IRatingService
    {
        Task AddRatingAsync(int bookingId, CreateRatingDTO dto);
        Task<RatingDTO?> GetRatingByBookingAndUserAsync(int bookingId, int studentId);
    }
}
