using Microsoft.Extensions.Options;
using ServerSide.Constants;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.Room;
using ServerSide.Exceptions;
using ServerSide.Models;
using ServerSide.Services;

namespace ServerSide.Validations
{
    public class CreateBookingValidation
    {
        private readonly BookingRules _rules;
        public CreateBookingValidation(IOptions<BookingRules> options) {
            _rules = options.Value;
        }
        public void ValidateBookingDate(CreateBookingDTO createBookingDTO, Slot slot)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var now = DateTime.Now;
            if (createBookingDTO.BookingDate < today)
                throw new BookingPolicyViolationException("Booking date cannot be in the past.");

            if (createBookingDTO.BookingDate > today.AddDays(_rules.MaxIntervalDayToBook))
                throw new BookingPolicyViolationException($"Booking date cannot be more than {_rules.MaxIntervalDayToBook} days in advance.");

            if (createBookingDTO.BookingDate == today && slot.FromTime < TimeOnly.FromDateTime(now))
                throw new BookingPolicyViolationException("Cannot book a slot in the past.");
        }

        public void ValidateCapacity(CreateBookingDTO createBookingDTO, CreateBookingRoomDTO room)
        {
            if ((float)room.Capacity * _rules.MinCapacityPercentage / 100 > createBookingDTO.StudentListCode.Count())
            {
                throw new BookingPolicyViolationException($"Number of students is less than {_rules.MinCapacityPercentage}% of room's capacity.");
            }
            if (room.Capacity < createBookingDTO.StudentListCode.Count())
            {
                throw new BookingPolicyViolationException("Number of students exceeds room's capacity.");
            }
        }
    }
}
