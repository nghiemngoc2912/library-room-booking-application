using System.ComponentModel.DataAnnotations;

namespace ServerSide.DTOs.Booking;

public class CreateRatingDTO
{
    public int StudentId { get; set; }

    [Range(1, 5)]
    public int RatingValue { get; set; } // 1–5
    public string? Comment { get; set; }
}
