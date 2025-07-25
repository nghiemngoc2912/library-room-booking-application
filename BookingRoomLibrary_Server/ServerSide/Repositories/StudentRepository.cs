using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.DTOs.Student;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public StudentRepository(LibraryRoomBookingContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<User>> GetRelatedStudentsAsync(int userId)
        {
            var reports = await _context.Reports
                .Where(r => r.UserId == userId)
                .Include(r => r.Room)
                .ToListAsync();

            var relatedUserIds = reports
                .SelectMany(r => _context.Reports
                    .Where(rr => rr.RoomId == r.RoomId && rr.UserId != userId)
                    .Select(rr => rr.UserId))
                .Distinct();

            return await _context.Users
                .Where(u => relatedUserIds.Contains(u.Id) || u.Id == userId)
                .ToListAsync();
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

        List<User> IStudentRepository.GetStudentsListByReputation(int min, int max)
        {
            return 
                _context.Users
                .Include(u=>u.Account)
                .Where(
                    u=>u.Account.Role==(byte)Roles.Student
                    &&u.Reputation>=min
                    &&u.Reputation<=max)
                .ToList();
        }
        public void Update(User student)
        {
            _context.Users.Update(student);
        }
        public void Save()
        {
            _context.SaveChanges();
        }
    }

    public interface IStudentRepository
    {
        Task<IEnumerable<User>> GetRelatedStudentsAsync(int userId);
        List<User> GetStudentsListByReputation(int min, int max);
        Task<User> GetUserByIdAsync(int id);
        void Save();
        void Update(User student);
        Task UpdateUserAsync(User user);
    }
}