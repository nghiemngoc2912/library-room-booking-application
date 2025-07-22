using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class OtpCode
{
    public Guid Id { get; set; }

    public string Username { get; set; } = null!;

    public string Code { get; set; } = null!;

    public int OtpType { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiredAt { get; set; }
}
