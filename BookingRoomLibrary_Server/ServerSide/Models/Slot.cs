using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Slot
{
    public int Id { get; set; }

    public int Order { get; set; }

    public byte Status { get; set; }

    public TimeOnly FromTime { get; set; }

    public TimeOnly ToTime { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
