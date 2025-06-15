using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Rule
{
    public int Id { get; set; }

    public string RuleName { get; set; } = null!;

    public string? Description { get; set; }

    public byte? Status { get; set; }

    public DateTime? CreateAt { get; set; }

    public int UserId { get; set; }

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual User User { get; set; } = null!;
}
