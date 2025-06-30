using ServerSide.Models;

public interface IBookingRepository
{
    Task<List<Booking>> GetBookingsByUser(int userId, DateOnly? from, DateOnly? to, int page, int pageSize);
    Task<int> CountBookingsByUser(int userId, DateOnly? from, DateOnly? to);
    IEnumerable<Booking> GetBookingByDateAndStatus(DateOnly date, byte status);
}
