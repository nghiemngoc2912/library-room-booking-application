using System;
using System.Collections.Generic;

namespace ServerSide.Models;

public partial class Account
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public byte Role { get; set; }

    public byte Status { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
