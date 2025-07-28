using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Booking
{
    public int Id { get; set; }

    public int CreatedBy { get; set; }

    public DateOnly BookingDate { get; set; }

    public int RoomId { get; set; }

    public int SlotId { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? CheckInAt { get; set; }

    public DateTime? CheckOutAt { get; set; }

    public byte Status { get; set; }

    public string? Reason { get; set; }
    public bool? ReminderSent { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual Room Room { get; set; } = null!;

    public virtual Slot Slot { get; set; } = null!;

    public virtual ICollection<User> Students { get; set; } = new List<User>();
}
