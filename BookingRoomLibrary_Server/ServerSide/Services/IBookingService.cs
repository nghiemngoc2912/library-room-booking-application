using ServerSide.DTOs.Booking;
using Microsoft.AspNetCore.Mvc;
using ServerSide.Models;

public interface IBookingService
{
    IEnumerable<HomeBookingDTO> GetBookingByDateAndStatus(DateOnly date, byte status);

    Task<(int total, List<BookingHistoryDTO> data)> GetBookingHistoryAsync(
        int userId, DateTime? from, DateTime? to, int page, int pageSize);
    Task AddRatingAsync(int bookingId, CreateRatingDTO dto);
}