using Glimpse.Core.Extensibility;
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
        private readonly IUserService userService;
        private readonly ISlotService slotService;
        private readonly IRoomService roomService;
        private readonly LibraryRoomBookingContext context;
        private readonly IStudentService studentService;

        public BookingService(
            IBookingRepository repository,
            IUserService userService,
            ISlotService slotService,
            IRoomService roomService,
            LibraryRoomBookingContext context,
            IStudentService studentService)
        {
            this.repository = repository;
            this.userService = userService;
            this.slotService = slotService;
            this.roomService = roomService;
            this.studentService = studentService;
            this.context = context;
        }

        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            var listRaw = repository.GetBookingByDateAndStatus(date, status);
            return listRaw.Select(x => new HomeBookingDTO(x)).ToList();
        }

        public void CreateBooking(CreateBookingDTO createBookingDTO, int userId)
        {
            var slot = slotService.GetById(createBookingDTO.SlotId);
            CreateBookingValidation.ValidateBookingDate(createBookingDTO, slot);

            var room = roomService.GetRoomByIdForBooking(createBookingDTO.RoomId);
            CreateBookingValidation.ValidateCapacity(createBookingDTO, room);

            var users = new List<User>();
            DateOnly bookingDate = createBookingDTO.BookingDate;
            DateOnly dayBeforeAWeek = bookingDate.AddDays(-7);

            foreach (var code in createBookingDTO.StudentListCode)
            {
                var user = userService.GetUserByCode(code);
                if (user == null || user.Account.Role != Roles.Student)
                    throw new BookingPolicyViolationException($"User with code {code} is not a valid student.");

                if (user.Reputation < BookingRules.MinReputationToBook)
                    throw new BookingPolicyViolationException($"User with code {code} has reputation under 50");

                int countDay = GetBookingCountByDateAndUser(user, bookingDate, bookingDate);
                if (countDay >= BookingRules.MaxDailyBookingsPerStudent)
                    throw new BookingPolicyViolationException($"User with code {code} exceeds daily limit.");

                int countWeek = GetBookingCountByDateAndUser(user, dayBeforeAWeek, bookingDate);
                if (countWeek >= BookingRules.MaxWeeklyBookingDays)
                    throw new BookingPolicyViolationException($"User with code {code} exceeds weekly limit.");

                if (users.Contains(user))
                    throw new BookingPolicyViolationException($"User with code {code} is duplicated in booking.");

                users.Add(user);
            }

            var booking = new Booking
            {
                BookingDate = createBookingDTO.BookingDate,
                RoomId = createBookingDTO.RoomId,
                SlotId = createBookingDTO.SlotId,
                Reason = createBookingDTO.Reason,
                Students = users,
                CreatedBy = userId
            };

            if (!CheckBookingAvailable(booking))
                throw new BookingPolicyViolationException($"Room {room.RoomName} is unavailable at slot {slot.Order} on {createBookingDTO.BookingDate}");

            repository.Add(booking);
        }

        public int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate)
        {
            return repository.GetBookingCountByDateAndUser(user, fromDate, toDate);
        }

        public bool CheckBookingAvailable(Booking booking)
        {
            var bookings = GetBookingByDateAndStatus(booking.BookingDate, 0);
            return !bookings.Any(b => b.RoomId == booking.RoomId && b.SlotId == booking.SlotId);
        }

        public async Task<(int total, List<BookingHistoryDTO> data)> GetBookingHistoryAsync(
            int userId, DateTime? from, DateTime? to, int page, int pageSize)
        {
            DateOnly? fromDate = from.HasValue ? DateOnly.FromDateTime(from.Value) : null;
            DateOnly? toDate = to.HasValue ? DateOnly.FromDateTime(to.Value) : null;

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
        public BookingDetailDTO GetDetailBookingById(int id)
        {
            var booking = repository.GetBookingById(id);
            if (booking == null) return null;

            var createdBy = userService.GetUserById(booking.CreatedBy);

            return new BookingDetailDTO
            {
                Id = booking.Id,
                BookingDate = booking.BookingDate,
                Reason = booking.Reason,
                SlotId = booking.SlotId,
                RoomId = booking.RoomId,
                CreatedDate = booking.CreatedDate,
                CreatedBy = new UserBookingDTO(createdBy),
                Status = booking.Status,
                CheckInAt = booking.CheckInAt,
                CheckOutAt = booking.CheckOutAt,
                Students = booking.Students?.Select(s => new UserBookingDTO(s)).ToList()
            };
        }
        public (bool success, string message, Booking booking) CheckIn(int id)
        {
            var booking = repository.GetBookingById(id);
            if (booking == null)
                return (false, "Booking does not exist", null);

            if (booking.CheckInAt != null)
                return (false, "Booking was already checked in", booking);

            var now = DateTime.Now;
            var slotStart = booking.BookingDate.ToDateTime(booking.Slot.FromTime);

            var early = slotStart.AddMinutes(-BookingRules.MaxTimeToCheckin);
            var late = slotStart.AddMinutes(BookingRules.MaxTimeToCheckin);

            if (now < early || now > late)
            {
                return (false, $"You can check in within {BookingRules.MaxTimeToCheckin} minutes before and after: {slotStart:HH:mm}", booking);
            }
            booking.Status = BookingRoomStatus.Checkined;
            booking.CheckInAt = now;
            repository.UpdateBooking(booking);

            return (true, "Check-in successfully", booking);
        }

        public (bool success, string message, Booking booking) CheckOut(int id)
        {
            var booking = repository.GetBookingById(id);
            if (booking == null)
                return (false, "Booking does not exist", null);

            if (booking.CheckOutAt != null)
                return (false, "Booking was already checked out", booking);

            var now = DateTime.Now;
            var slotEnd = booking.BookingDate.ToDateTime(booking.Slot.ToTime);

            var early = slotEnd.AddMinutes(-BookingRules.MaxTimeToCheckout);
            var late = slotEnd.AddMinutes(BookingRules.MaxTimeToCheckout);

            if (now < early)
            {
                return (false, $"You can check out within {BookingRules.MaxTimeToCheckout} minutes before and after: {slotEnd:HH:mm}", booking);
            }
            if (now > late)
            {
                studentService.SubtractReputationAsync(booking.CreatedBy, -10, "");
            }
            booking.Status = BookingRoomStatus.Checkouted;
            booking.CheckOutAt = now;
            repository.UpdateBooking(booking);

            return (true, "Check-out successfully", booking);
        }

        public async Task CancelExpiredBookingsAsync()
        {
            var expiredBookings = await repository.GetExpiredBooking();

            foreach (var booking in expiredBookings)
            {
                booking.Status = BookingRoomStatus.AutoCanceled;
                //tru diem reputation
                await studentService.SubtractReputationAsync(booking.CreatedBy, -10, "");
            }

            await context.SaveChangesAsync();
        }

        void IBookingService.CancelBooking(int id)
        {
            var booking=repository.GetBookingById(id);
            if (booking == null) return;
            booking.Status = BookingRoomStatus.Canceled;
            repository.UpdateBooking(booking);
        }
    }

    public interface IBookingService
    {
        BookingDetailDTO GetDetailBookingById(int id);
        (bool success, string message, Booking booking) CheckIn(int id);
        (bool success, string message, Booking booking) CheckOut(int id);
        void CreateBooking(CreateBookingDTO createBookingDTO,int userId);
        IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status);
        int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate);
        bool CheckBookingAvailable(Booking booking);
        Task<(int total, List<BookingHistoryDTO> data)> GetBookingHistoryAsync(int userId, DateTime? from, DateTime? to, int page, int pageSize);
        Task AddRatingAsync(int bookingId, CreateRatingDTO dto);
        Task CancelExpiredBookingsAsync();
        void CancelBooking(int id);
    }
}