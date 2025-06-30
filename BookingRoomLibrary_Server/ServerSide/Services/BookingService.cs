using Microsoft.AspNetCore.Http.HttpResults;
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
    public class BookingService:IBookingService
    {
        //remember DI in Program.cs
        private readonly IBookingRepository repository;
        private readonly IUserService userService;
        private readonly ISlotService slotService;
        private readonly IRoomService roomService;

        public BookingService(IBookingRepository repository,IUserService userService, ISlotService slotService, IRoomService roomService)
        {
            this.repository = repository;
            this.userService = userService;
            this.slotService = slotService;
            this.roomService = roomService;
        }

        public IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            var listRaw = repository.GetBookingByDateAndStatus(date,status);
            var list = listRaw.Select(x=>new HomeBookingDTO(x)).ToList();
            return list;
        }
        //create booking
        //check date and slot before datetime now - done
        //check capacity - done
        //check available
        //check duplicate data code
        //check if is student - done
        //check student reputation - done
        //check booking time in a day - done 
        //check booking time in 7 days - done

        //NOT DONE: created by

        public void CreateBooking(CreateBookingDTO createBookingDTO)
        {
            //check date
            var slot=slotService.GetById(createBookingDTO.SlotId);
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
                int bookingTimesInDay = GetBookingCountByDateAndUser(user, bookingDate,bookingDate);
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
                CreatedBy=users.ElementAt(0).Id
            };
            //check available
            if(CheckBookingAvailable(booking))
                repository.Add(booking);
            else
                throw new BookingPolicyViolationException($"Room {room.RoomName} is unavailble in slot {slot.Order} date {createBookingDTO.BookingDate}");
        }

        public int GetBookingCountByDateAndUser(User user,DateOnly fromDate,DateOnly toDate)
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
        public Booking GetDetailBookingById(int id)
        {
            return repository.GetBookingById(id);
        }
    }
    public interface IBookingService
    {
        void CreateBooking(CreateBookingDTO createBookingDTO);
        IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date,byte status);
        int GetBookingCountByDateAndUser(User user,DateOnly fromDate,DateOnly toDate);
        Boolean CheckBookingAvailable(Booking booking);
        Booking GetDetailBookingById(int id);
    }
}
