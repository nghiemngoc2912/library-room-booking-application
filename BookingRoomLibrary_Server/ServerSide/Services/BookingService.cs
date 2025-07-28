using Glimpse.Core.Extensibility;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.Rating;
using ServerSide.DTOs.Room;
using ServerSide.Exceptions;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Validations;
using System.Text.Json;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;


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
        private readonly IRatingService _ratingService;
        private readonly BookingRules _rules;
        private readonly CreateBookingValidation validation;
        private readonly IEmailService _emailService;


        public BookingService(
            IBookingRepository repository,
            IUserService userService,
            ISlotService slotService,
            IRoomService roomService,
            LibraryRoomBookingContext context,
            IStudentService studentService,
            IRatingService ratingService,
            IOptions<BookingRules> options,
            CreateBookingValidation validation,
            IEmailService emailService
            )
        {
            this.repository = repository;
            this.userService = userService;
            this.slotService = slotService;
            this.roomService = roomService;
            this.context = context;
            this.studentService = studentService;
            this._ratingService = ratingService;
            _rules = options.Value;
            this.validation = validation;
            _emailService = emailService;
        }

        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            var listRaw = repository.GetBookingByDateAndStatus(date, status);
            return listRaw.Select(x => new HomeBookingDTO(x)).ToList();
        }

        public void CreateBooking(CreateBookingDTO createBookingDTO, int userId)
        {
            var slot = slotService.GetById(createBookingDTO.SlotId);
            if (slot.Status != (byte)SlotStatus.Active)
                throw new BookingPolicyViolationException($"Slot is not active.");
            validation.ValidateBookingDate(createBookingDTO, slot);

            var room = roomService.GetRoomByIdForBooking(createBookingDTO.RoomId);
            if (room.Status != (byte)RoomStatus.Active)
                throw new BookingPolicyViolationException($"Slot is not active active.");
            validation.ValidateCapacity(createBookingDTO, room);

            var users = new List<User>();
            DateOnly bookingDate = createBookingDTO.BookingDate;
            DateOnly dayBeforeAWeek = bookingDate.AddDays(-7);

            foreach (var code in createBookingDTO.StudentListCode)
            {
                var user = userService.GetUserByCode(code);
                if (user == null || user.Account.Role != (byte)Roles.Student)
                    throw new BookingPolicyViolationException($"User with code {code} is not a valid student.");

                if (user.Reputation < _rules.MinReputationToBook)
                    throw new BookingPolicyViolationException($"User with code {code} has reputation under {_rules.MinReputationToBook}");

                int countDay = GetBookingCountByDateAndUser(user, bookingDate, bookingDate);
                if (countDay >= _rules.MaxDailyBookingsPerStudent)
                    throw new BookingPolicyViolationException($"User with code {code} exceeds daily limit.");

                int countWeek = GetBookingCountByDateAndUser(user, dayBeforeAWeek, bookingDate);
                if (countWeek >= _rules.MaxWeeklyBookingDays)
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

            // Đếm tổng số booking của userId (dựa trên CreatedBy)
            var total = await repository.CountBookingsByUser(userId, fromDate, toDate);

            // Lấy danh sách booking
            var bookings = await repository.GetBookingsByUser(userId, fromDate, toDate, page, pageSize);

            var result = new List<BookingHistoryDTO>();

            foreach (var b in bookings)
            {
                var rating = await _ratingService.GetRatingByBookingAndUserAsync(b.Id, userId);
                result.Add(new BookingHistoryDTO
                {
                    Id = b.Id,
                    BookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                    RoomName = b.Room.RoomName,
                    Slot = $"{b.Slot.FromTime} - {b.Slot.ToTime}",
                    Status = b.Status,
                    Rating = rating
                });
            }

            return (total, result);
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

            var early = slotStart.AddMinutes(-_rules.MaxTimeToCheckin);
            var late = slotStart.AddMinutes(_rules.MaxTimeToCheckin);

            if (now < early || now > late)
            {
                return (false, $"You can check in within {_rules.MaxTimeToCheckin} minutes before and after: {slotStart:HH:mm}", booking);
            }
            booking.Status = (byte)BookingRoomStatus.Checkined;
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

            var early = slotEnd.AddMinutes(-_rules.MaxTimeToCheckout);
            var late = slotEnd.AddMinutes(_rules.MaxTimeToCheckout);

            if (now < early)
                return (false, $"You can check out within {_rules.MaxTimeToCheckout} minutes before and after: {slotEnd:HH:mm}", booking);

            if (now > late)
            {
                studentService.SubtractReputationAsync(booking.CreatedBy, _rules.SubstractReputation, "");
            }
            booking.Status = (byte)BookingRoomStatus.Checkouted;
            booking.CheckOutAt = now;
            repository.UpdateBooking(booking);

            return (true, "Check-out successfully", booking);
        }

        public async Task CancelExpiredBookingsAsync()
        {
            var expiredBookings = await repository.GetExpiredBooking();
            foreach (var booking in expiredBookings)
            {
                booking.Status = (byte)BookingRoomStatus.AutoCanceled;
                //tru diem reputation
                await studentService.SubtractReputationAsync(booking.CreatedBy, _rules.SubstractReputation, "");
                repository.UpdateBooking(booking);
            }
        }

        public void CancelBooking(int id)
        {
            var booking = repository.GetBookingById(id);
            if (booking == null) return;
            var slot = slotService.GetById(booking.SlotId);
            if (slot == null) return;
            var bookingDate = booking.BookingDate;
            var slotStartTime = slot.FromTime;
            booking.Status = (byte)BookingRoomStatus.Canceled;
            var bookingStartDateTime = bookingDate.ToDateTime(slotStartTime);
            if ((bookingStartDateTime - DateTime.Now).TotalHours < _rules.CancelTimeInterval)
            {
                throw new BookingPolicyViolationException($"You just can cancel your booking before at least {_rules.CancelTimeInterval}.");
            }
            repository.UpdateBooking(booking);
        }

        public void CreateMaintenanceBooking(MaintenanceBookingDTO maintenanceBookingDTO, int userId)
        {
            var slot = slotService.GetById(maintenanceBookingDTO.SlotId);
            if (slot == null || (slot.Status != (byte)SlotStatus.Active && slot.Status != (byte)SlotStatus.OnlyForMaintain))
            {
                Console.WriteLine($"Invalid slot for maintenance. SlotId: {maintenanceBookingDTO.SlotId}");
                throw new BookingPolicyViolationException("Invalid slot for maintenance.");
            }

            var room = roomService.GetRoomByIdForBooking(maintenanceBookingDTO.RoomId);
            if (room == null || room.Status != (byte)RoomStatus.Active)
            {
                Console.WriteLine($"Invalid room for maintenance. RoomId: {maintenanceBookingDTO.RoomId}");
                throw new BookingPolicyViolationException("Room is not available for maintenance.");
            }

            var staff = userService.GetUserById(userId);
            if (staff == null)
            {
                Console.WriteLine($"Staff user not found for userId: {userId}");
                throw new Exception("Staff user not found.");
            }
            var staffAccount = staff.Account;
            if (staffAccount == null)
            {
                Console.WriteLine($"Staff account not found for userId: {userId}");
                throw new Exception("Staff account not found.");
            }
            var staffEmail = staffAccount.Username;

            if (maintenanceBookingDTO.DateRange == null)
            {
                // Single date booking
                var bookingDate = DateOnly.Parse(maintenanceBookingDTO.BookingDate);
                validation.ValidateBookingDate(new CreateBookingDTO { BookingDate = bookingDate, SlotId = maintenanceBookingDTO.SlotId }, slot);

                // Check for conflicting bookings
                var conflictingBookings = repository.GetBookingByDateAndStatus(bookingDate, (byte)BookingRoomStatus.Booked)
                    .Where(b => b.RoomId == maintenanceBookingDTO.RoomId && b.SlotId == maintenanceBookingDTO.SlotId).ToList();

                var booking = new Booking
                {
                    BookingDate = bookingDate,
                    RoomId = maintenanceBookingDTO.RoomId,
                    SlotId = maintenanceBookingDTO.SlotId,
                    Reason = maintenanceBookingDTO.Reason,
                    CreatedBy = userId,
                    Status = (byte)BookingRoomStatus.bookedForMainainace,
                    CreatedDate = DateTime.Now
                };

                if (!CheckBookingAvailable(booking))
                {
                    throw new BookingPolicyViolationException($"Room {room.RoomName} is unavailable at slot {slot.Order} on {bookingDate}");
                }

                // Handle conflicts
                foreach (var conflictingBooking in conflictingBookings)
                {
                    if (conflictingBooking == null)
                    {
                        Console.WriteLine($"Null conflicting booking found for date: {bookingDate}, RoomId: {maintenanceBookingDTO.RoomId}, SlotId: {maintenanceBookingDTO.SlotId}");
                        continue;
                    }
                    conflictingBooking.Status = (byte)BookingRoomStatus.CanceledForMaintainance;
                    repository.UpdateBooking(conflictingBooking);

                    var creator = userService.GetUserById(conflictingBooking.CreatedBy);
                    if (creator == null)
                    {
                        Console.WriteLine($"Creator not found for booking CreatedBy: {conflictingBooking.CreatedBy}");
                        continue;
                    }
                    var creatorAccount = creator.Account;
                    if (creatorAccount == null)
                    {
                        Console.WriteLine($"Creator account not found for userId: {conflictingBooking.CreatedBy}");
                        continue;
                    }
                    var creatorEmail = creatorAccount.Username;

                    // Send email to booking creator
                    var cancellationMessage = $"Your booking for room {room.RoomName} on {bookingDate:yyyy-MM-dd} at slot {slot.FromTime} - {slot.ToTime} has been canceled due to a maintenance schedule with reason: {maintenanceBookingDTO.Reason}";
                    _emailService.SendEmailAsync(creatorEmail, "Booking Canceled Due to Maintenance", cancellationMessage).Wait();

                    // Send notification to staff
                    var staffNotification = $"Maintenance booking conflict detected. Booking by {creator.FullName} on {bookingDate:yyyy-MM-dd} at slot {slot.FromTime} - {slot.ToTime} has been canceled for maintenance with reason: {maintenanceBookingDTO.Reason}";
                    _emailService.SendEmailAsync(staffEmail, "Maintenance Booking Conflict", staffNotification).Wait();
                }

                repository.Add(booking);
            }
            else
            {
                // Range of dates booking
                var fromDate = DateOnly.Parse(maintenanceBookingDTO.DateRange.From);
                var toDate = DateOnly.Parse(maintenanceBookingDTO.DateRange.To);

                if (fromDate > toDate)
                    throw new BookingPolicyViolationException("Invalid date range: 'From' date must be before 'To' date.");

                for (var date = fromDate; date <= toDate; date = date.AddDays(1))
                {
                    var booking = new Booking
                    {
                        BookingDate = date,
                        RoomId = maintenanceBookingDTO.RoomId,
                        SlotId = maintenanceBookingDTO.SlotId,
                        Reason = maintenanceBookingDTO.Reason,
                        CreatedBy = userId,
                        Status = (byte)BookingRoomStatus.bookedForMainainace,
                        CreatedDate = DateTime.Now
                    };

                    // Check for conflicting bookings
                    var conflictingBookings = repository.GetBookingByDateAndStatus(date, (byte)BookingRoomStatus.Booked)
                        .Where(b => b.RoomId == maintenanceBookingDTO.RoomId && b.SlotId == maintenanceBookingDTO.SlotId).ToList();

                    if (!CheckBookingAvailable(booking))
                    {
                        throw new BookingPolicyViolationException($"Room {room.RoomName} is unavailable at slot {slot.Order} on {date}");
                    }

                    // Handle conflicts
                    foreach (var conflictingBooking in conflictingBookings)
                    {
                        if (conflictingBooking == null)
                        {
                            Console.WriteLine($"Null conflicting booking found for date: {date}, RoomId: {maintenanceBookingDTO.RoomId}, SlotId: {maintenanceBookingDTO.SlotId}");
                            continue;
                        }
                        conflictingBooking.Status = (byte)BookingRoomStatus.CanceledForMaintainance;
                        repository.UpdateBooking(conflictingBooking);

                        var creator = userService.GetUserById(conflictingBooking.CreatedBy);
                        if (creator == null)
                        {
                            Console.WriteLine($"Creator not found for booking CreatedBy: {conflictingBooking.CreatedBy}");
                            continue;
                        }
                        var creatorAccount = creator.Account;
                        if (creatorAccount == null)
                        {
                            Console.WriteLine($"Creator account not found for userId: {conflictingBooking.CreatedBy}");
                            continue;
                        }
                        var creatorEmail = creatorAccount.Username;

                        // Send email to booking creator
                        var cancellationMessage = $"Your booking for room {room.RoomName} on {date:yyyy-MM-dd} at slot {slot.FromTime} - {slot.ToTime} has been canceled due to a maintenance schedule with reason: {maintenanceBookingDTO.Reason}";
                        _emailService.SendEmailAsync(creatorEmail, "Booking Canceled Due to Maintenance", cancellationMessage).Wait();

                        // Send notification to staff
                        var staffNotification = $"Maintenance booking conflict detected. Booking by {creator.FullName} on {date:yyyy-MM-dd} at slot {slot.FromTime} - {slot.ToTime} has been canceled for maintenance with reason: {maintenanceBookingDTO.Reason}";
                        _emailService.SendEmailAsync(staffEmail, "Maintenance Booking Conflict", staffNotification).Wait();
                    }

                    repository.Add(booking);
                }
            }
        }

        public async Task CheckAndSendRemindersAsync()
        {
            var now = DateTime.Now;
            var targetTime = now.AddHours(_rules.SendMailRemind); // ví dụ 6h
            var fromTime = now;

            var bookings = await repository.GetBookingsToRemindAsync();

            foreach (var booking in bookings)
            {
                var slotTime = booking.Slot.FromTime; // TimeSpan
                var bookingStart = booking.BookingDate.ToDateTime(slotTime);

                if (bookingStart >= fromTime && bookingStart <= targetTime)
                {
                    var email = booking.CreatedByNavigation.Account.Username;
                    if (!string.IsNullOrEmpty(email))
                    {
                        await _emailService.SendEmailAsync(
                            email,
                            "Remind room booking in FPTU library",
                            "Remember to come and check in the room you booked in FPTU library"
                        );
                        booking.ReminderSent = true;
                    }
                }
            }

            await repository.SaveChangesAsync();
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
        Task CancelExpiredBookingsAsync();
        void CancelBooking(int id);
        void CreateMaintenanceBooking(MaintenanceBookingDTO maintenanceBookingDTO, int userId);
        Task CheckAndSendRemindersAsync();
    }
}
