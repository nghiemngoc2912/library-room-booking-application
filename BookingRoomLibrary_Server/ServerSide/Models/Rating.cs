using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Rating
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public int BookingId { get; set; }

    public int RatingValue { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedDate { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual User Student { get; set; } = null!;
}
