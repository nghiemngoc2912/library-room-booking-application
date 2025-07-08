using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly LibraryRoomBookingContext context;

        public UserRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        public IEnumerable<User> SearchUserByCode(string code)
        {
            return context.Users.Where(x => x.Code.Contains(code));
        }

        public User GetUserByCode(string code)
        {
            return context.Users
                .Include(u => u.Account)
                .FirstOrDefault(u => u.Code == code);
        }

        public async Task<User?> GetUserWithReports(int userId)
        {
            return await context.Users
                .Include(u => u.ReportUsers)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }

    public interface IUserRepository
    {
        User GetUserByCode(string code);
        IEnumerable<User> SearchUserByCode(string code);
        Task<User?> GetUserWithReports(int userId);
    }
}
