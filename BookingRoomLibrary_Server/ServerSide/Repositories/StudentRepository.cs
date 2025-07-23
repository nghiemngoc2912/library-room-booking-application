using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public StudentRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetRelatedStudentsAsync(int userId)
        {
            // Lấy report gần nhất của sinh viên
            var report = await _context.Reports
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreateAt)
                .FirstOrDefaultAsync();

            if (report == null || report.CreateAt == null)
                throw new Exception("No report found for the given user.");

            // Lấy danh sách studentId có mặt tại phòng đó vào thời điểm report
            var relatedStudentIds = await _context.Bookings
                .Where(b => b.RoomId == report.RoomId &&
                            b.CheckInAt <= report.CreateAt &&
                            b.CheckOutAt >= report.CreateAt &&
                            b.Status == 2)
                .SelectMany(b => b.Students.Select(s => s.Id))
                .Distinct()
                .ToListAsync();

            // Truy vấn người dùng từ bảng Users bằng Id
            var users = await _context.Users
                .Where(u => relatedStudentIds.Contains(u.Id))
                .ToListAsync();

            return users;
        }

        public async Task<User> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id)
                ?? throw new KeyNotFoundException($"User with ID {id} not found.");
        }

        public async Task UpdateUserAsync(User user)
        {
            if (user.Reputation.HasValue && user.Reputation < 0)
                user.Reputation = 0;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }

    public interface IStudentRepository
    {
        Task<IEnumerable<User>> GetRelatedStudentsAsync(int userId);
        Task<User> GetUserByIdAsync(int id);
        Task UpdateUserAsync(User user);
    }
}
