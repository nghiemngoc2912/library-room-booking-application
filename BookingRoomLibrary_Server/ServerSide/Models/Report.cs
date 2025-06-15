using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Report
{
    public int Id { get; set; }

    public int RuleId { get; set; }

    public string? ReportType { get; set; }

    public string? Description { get; set; }

    public byte? Status { get; set; }

    public DateTime? CreateAt { get; set; }

    public int UserId { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public int? ResolvedBy { get; set; }

    public int RoomId { get; set; }

    public virtual User? ResolvedByNavigation { get; set; }

    public virtual Room Room { get; set; } = null!;

    public virtual Rule Rule { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
