
using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class BookingRepository:IBookingRepository
    {
        //remember DI in Program.cs
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

        IEnumerable<Booking> IBookingRepository.GetBookingByDateAndStatus(DateOnly date, byte status)
        {
            return context.Bookings.Where(x=>x.BookingDate == date&&x.Status==status).ToList();
        }

        int IBookingRepository.GetBookingCountByDateAndUser(User user, DateOnly fromDate,DateOnly toDate)
        {
            return context.Bookings
                .Where(b => b.BookingDate >=fromDate &&b.BookingDate<=toDate && b.Students.Any(s => s.Id == user.Id))
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
    }
    public interface IBookingRepository
    {
        IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date,byte status);
        void Add(Booking booking);
        int GetBookingCountByDateAndUser(User user, DateOnly fromDate, DateOnly toDate);
        Booking GetBookingById(int id);
        void UpdateBooking(Booking booking);
    }
}
