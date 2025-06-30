using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.Room;
using ServerSide.Exceptions;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Validations;

namespace ServerSide.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository repository;
        private readonly LibraryRoomBookingContext context;
        private readonly IRoomService roomService;
        private readonly ISlotService slotService;
        private readonly IUserService userService;

        public BookingService(IBookingRepository repository, LibraryRoomBookingContext context, IRoomService roomService, ISlotService slotService, IUserService userService)
        {
            this.repository = repository;
            this.context = context;
            this.roomService = roomService;
            this.slotService = slotService;
            this.userService = userService;
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

        public void CreateBooking(CreateBookingDTO createBookingDTO)
        {
            //check date
            var slot = slotService.GetById(createBookingDTO.SlotId);
            CreateBookingValidation.ValidateBookingDate(createBookingDTO, slot);
            //check capacity
            CreateBookingRoomDTO room = roomService.GetRoomByIdForBooking(createBookingDTO.RoomId);
            CreateBookingValidation.ValidateCapacity(createBookingDTO, room);

            List<User> users = new List<User>();
            foreach (var s in createBookingDTO.StudentListCode)
            {
                User user = userService.GetUserByCode(s);

                if (user == null || user.Account.Role != Roles.Student)
                {
                    throw new BookingPolicyViolationException($"User with code {s} is not a valid student.");
                }
                //check reputation
                if (user.Reputation < BookingRules.MinReputationToBook)
                {
                    throw new BookingPolicyViolationException($"User with code {s} has reputation under 50");
                }
                //check times booking in the booking day
                //booking in day -> studentbooking 
                DateOnly bookingDate = createBookingDTO.BookingDate;
                DateOnly dayBeforeAWeek = bookingDate.AddDays(-7);
                int bookingTimesInDay = GetBookingCountByDateAndUser(user, bookingDate, bookingDate);
                if (bookingTimesInDay >= BookingRules.MaxDailyBookingsPerStudent)
                {
                    throw new BookingPolicyViolationException($"User with code {s} has booking times in a day exceeds {BookingRules.MaxDailyBookingsPerStudent}");
                }
                int bookingTimesInWeek = GetBookingCountByDateAndUser(user, dayBeforeAWeek, bookingDate);
                if (bookingTimesInWeek >= BookingRules.MaxWeeklyBookingDays)
                {
                    throw new BookingPolicyViolationException($"User with code {s} has booking times in a week exceeds {BookingRules.MaxWeeklyBookingDays}");
                }
                if (users.Contains(user))
                {
                    throw new BookingPolicyViolationException($"User with code {s} is duplicate in booking");
                }
                users.Add(user);
            }
            var booking = new Booking
            {
                BookingDate = createBookingDTO.BookingDate,
                RoomId = createBookingDTO.RoomId,
                SlotId = createBookingDTO.SlotId,
                Reason = createBookingDTO.Reason,
                Students = users,
                CreatedBy = users.ElementAt(0).Id
            };
            //check available
            if (CheckBookingAvailable(booking))
                repository.Add(booking);
            else
                throw new BookingPolicyViolationException($"Room {room.RoomName} is unavailble in slot {slot.Order} date {createBookingDTO.BookingDate}");
        }

        public int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate)
        {
            return repository.GetBookingCountByDateAndUser(user, fromDate, toDate);
        }

        public bool CheckBookingAvailable(Booking booking)
        {
            //check booking at date, slot status
            var bookings = GetBookingByDateAndStatus(booking.BookingDate, 0);
            //if bookings contain room and slot available return false
            if (bookings.Any(b => b.RoomId == booking.RoomId && b.SlotId == booking.SlotId)) return false;
            return true;
        }
    }
    public interface IBookingService
    {
        IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status);
        void CreateBooking(CreateBookingDTO createBookingDTO);

        Task<(int total, List<BookingHistoryDTO> data)> GetBookingHistoryAsync(
            int userId, DateTime? from, DateTime? to, int page, int pageSize);
        Task AddRatingAsync(int bookingId, CreateRatingDTO dto);
    }
}