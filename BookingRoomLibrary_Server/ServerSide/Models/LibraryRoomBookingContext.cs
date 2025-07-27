using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ServerSide.Models;

public partial class LibraryRoomBookingContext : DbContext
{
    public LibraryRoomBookingContext()
    {
    }

    public LibraryRoomBookingContext(DbContextOptions<LibraryRoomBookingContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }
    public virtual DbSet<Booking> Bookings { get; set; }
    public virtual DbSet<News> News { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<OtpCode> OtpCodes { get; set; }
    public virtual DbSet<Rating> Ratings { get; set; }
    public virtual DbSet<Report> Reports { get; set; }
    public virtual DbSet<Room> Rooms { get; set; }
    public virtual DbSet<Rule> Rules { get; set; }
    public virtual DbSet<Slot> Slots { get; set; }
    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:MyCnn");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Account__3214EC272835AE0B");
            entity.ToTable("Account");
            entity.HasIndex(e => e.Username, "UQ__Account__536C85E48644BB6D").IsUnique();
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Role).HasDefaultValue((byte)1);
            entity.Property(e => e.Status).HasDefaultValue((byte)1);
            entity.Property(e => e.Username).HasMaxLength(100);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Booking__3214EC2726B9EB3F");
            entity.ToTable("Booking");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CheckInAt).HasColumnType("datetime");
            entity.Property(e => e.CheckOutAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.SlotId).HasColumnName("SlotID");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__Created__45F365D3");

            entity.HasOne(d => d.Room).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__RoomID__46E78A0C");

            entity.HasOne(d => d.Slot).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.SlotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__SlotID__47DBAE45");

            entity.HasMany(d => d.Students).WithMany(p => p.BookingsNavigation)
                .UsingEntity<Dictionary<string, object>>(
                    "BookingStudent",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("StudentId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Booking_S__Stude__4BAC3F29"),
                    l => l.HasOne<Booking>().WithMany()
                        .HasForeignKey("BookingId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Booking_S__Booki__4AB81AF0"),
                    j =>
                    {
                        j.HasKey("BookingId", "StudentId").HasName("PK__Booking___F0B9486AA04C74FC");
                        j.ToTable("Booking_Student");
                        j.IndexerProperty<int>("BookingId").HasColumnName("BookingID");
                        j.IndexerProperty<int>("StudentId").HasColumnName("StudentID");
                    });
        });

        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__News__3214EC27EDB9DB00");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.News)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__News__CreatedBy__59FA5E80");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notifica__3214EC2777A2B611");
            entity.ToTable("Notification");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__UserI__5629CD9C");
        });

        modelBuilder.Entity<OtpCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OtpCodes__3214EC07450C3372");
            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Code).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Username).HasMaxLength(255);
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rating__3214EC272AEBF224");
            entity.ToTable("Rating");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.BookingId).HasColumnName("BookingID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.StudentId).HasColumnName("StudentID");

            entity.HasOne(d => d.Booking).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Rating__BookingI__5165187F");

            entity.HasOne(d => d.Student).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Rating__StudentI__5070F446");
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Report__3214EC27C6421609");
            entity.ToTable("Report");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ReportType).HasMaxLength(100);
            entity.Property(e => e.ResolvedAt).HasColumnType("datetime");
            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.RuleId).HasColumnName("RuleID");
            entity.Property(e => e.Status).HasDefaultValue((byte)0);
            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.StartSlotId).HasColumnName("StartSlotId"); // Thêm cột mới
            entity.Property(e => e.EndSlotId).HasColumnName("EndSlotId");     // Thêm cột mới

            entity.HasOne(d => d.ResolvedByNavigation).WithMany(p => p.ReportResolvedByNavigations)
                .HasForeignKey(d => d.ResolvedBy)
                .HasConstraintName("FK__Report__Resolved__656C112C");

            entity.HasOne(d => d.Room).WithMany(p => p.Reports)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Report__RoomID__66603565");

            entity.HasOne(d => d.Rule).WithMany(p => p.Reports)
                .HasForeignKey(d => d.RuleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Report__RuleID__6383C8BA");

            entity.HasOne(d => d.User).WithMany(p => p.ReportUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Report__UserID__6477ECF3");

            entity.HasOne(d => d.StartSlot).WithMany(p => p.ReportStartSlots) // Thêm khóa ngoại
                .HasForeignKey(d => d.StartSlotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Report_StartSlotId_Slot");

            entity.HasOne(d => d.EndSlot).WithMany(p => p.ReportEndSlots)     // Thêm khóa ngoại
                .HasForeignKey(d => d.EndSlotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Report_EndSlotId_Slot");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room__3214EC2713161BB6");
            entity.ToTable("Room");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.RoomName).HasMaxLength(100);
        });

        modelBuilder.Entity<Rule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rule__3214EC275DDD7544");
            entity.ToTable("Rule");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RuleName).HasMaxLength(255);
            entity.Property(e => e.Status).HasDefaultValue((byte)1);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Rules)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Rule__UserID__5EBF139D");
        });

        modelBuilder.Entity<Slot>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Slot__3214EC27D47D5205");
            entity.ToTable("Slot");
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Status)
                .HasDefaultValue((byte)1)
                .HasColumnName("status");

            entity.HasMany(d => d.ReportStartSlots).WithOne(p => p.StartSlot) // Quan hệ với Report
                .HasForeignKey(p => p.StartSlotId)
                .HasConstraintName("FK_Report_StartSlotId_Slot");

            entity.HasMany(d => d.ReportEndSlots).WithOne(p => p.EndSlot)     // Quan hệ với Report
                .HasForeignKey(p => p.EndSlotId)
                .HasConstraintName("FK_Report_EndSlotId_Slot");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC27EFEFD8F8");
            entity.ToTable("User");
            entity.HasIndex(e => e.Email, "UQ__User__A9D1053431D75E65").IsUnique();
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.Code).HasMaxLength(10);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.Reputation).HasDefaultValue(0);

            entity.HasOne(d => d.Account).WithMany(p => p.Users)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User__AccountID__3D5E1FD2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}