using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public DateOnly? Dob { get; set; }

    public int AccountId { get; set; }

    public string? Email { get; set; }

    public int? Reputation { get; set; }

    public string? Code { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<News> News { get; set; } = new List<News>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<Report> ReportResolvedByNavigations { get; set; } = new List<Report>();

    public virtual ICollection<Report> ReportUsers { get; set; } = new List<Report>();

    public virtual ICollection<Rule> Rules { get; set; } = new List<Rule>();

    public virtual ICollection<Booking> BookingsNavigation { get; set; } = new List<Booking>();
}
