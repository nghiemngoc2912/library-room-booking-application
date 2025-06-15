using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Room
{
    public int Id { get; set; }

    public string RoomName { get; set; } = null!;

    public byte Status { get; set; }

    public int Capacity { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
}
