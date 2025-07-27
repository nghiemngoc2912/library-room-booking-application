using Glimpse.Core.Extensibility;
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

        User IUserRepository.GetUserById(int id)
        {
            return context.Users.Find(id);
        }
        public IQueryable<User> GetUsersByRole(int role, string? keyword)
        {
            var query = context.Users
                .Where(u => u.Account.Role == (byte)role);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(u =>
                    u.FullName.Contains(keyword) ||
                    u.Code.Contains(keyword) ||
                    u.Account.Username.Contains(keyword));
            }

            return query;
        }

        public void UpdateAccount(Account account)
        {
            context.Accounts.Update(account);
            context.SaveChanges();
        }

        public async Task AddAsync(User user)
        {
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();
        }
    }

    public interface IUserRepository
    {
        User GetUserByCode(string s);
        User GetUserById(int id);
        IQueryable<User> GetUsersByRole(int role, string? keyword);      
        IEnumerable<User> SearchUserByCode(string code);
        Task<User?> GetUserWithReports(int userId);
        void UpdateAccount(Account account);
        Task AddAsync(User user);
    }
}
