using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Validations;

namespace ServerSide.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository repository;
        private readonly LibraryRoomBookingContext context;

        public BookingService(IBookingRepository repository, LibraryRoomBookingContext context)
        {
            this.repository = repository;
            this.context = context;
        }

        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            var listRaw = repository.GetBookingByDateAndStatus(date, status);
            var list = listRaw.Select(x => new HomeBookingDTO(x)).ToList();
            return list;
        }

        public async Task<(int total, List<BookingHistoryDTO> data)> GetBookingHistoryAsync(
            int userId, DateTime? from, DateTime? to, int page, int pageSize)
        {
            DateOnly? fromDate = from.HasValue ? DateOnly.FromDateTime(from.Value) : (DateOnly?)null;
            DateOnly? toDate = to.HasValue ? DateOnly.FromDateTime(to.Value) : (DateOnly?)null;

            var total = await repository.CountBookingsByUser(userId, fromDate, toDate);
            var bookings = await repository.GetBookingsByUser(userId, fromDate, toDate, page, pageSize);

            var result = bookings.Select(b => new BookingHistoryDTO
            {
                Id = b.Id,
                BookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                RoomName = b.Room.RoomName,
                Slot = $"{b.Slot.FromTime} - {b.Slot.ToTime}",
                Rating = b.Ratings
                    .Where(r => r.StudentId == userId)
                    .Select(r => new RatingDTO
                    {
                        RatingValue = r.RatingValue,
                        Comment = r.Comment
                    }).FirstOrDefault()
            }).ToList();

            return (total, result);
        }

        public async Task AddRatingAsync(int bookingId, CreateRatingDTO dto)
        {
            var alreadyRated = await context.Ratings
                .AnyAsync(r => r.BookingId == bookingId && r.StudentId == dto.StudentId);

            if (alreadyRated)
                throw new Exception("You have already rated this booking.");

            var joined = await context.Bookings
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

            context.Ratings.Add(rating);
            await context.SaveChangesAsync();
        }
    }
}
