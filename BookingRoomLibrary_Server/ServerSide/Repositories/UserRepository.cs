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

        User IUserRepository.GetUserByCode(string code)
        {
            return context.Users
                .Include(u => u.Account)
                .FirstOrDefault(s => s.Code == code);
        }
    }
    public interface IUserRepository
    {
        User GetUserByCode(string s);
        IEnumerable<User> SearchUserByCode(string code);
    }
}

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

        public async Task<User?> GetUserWithReports(int userId)
        {
            return await context.Users
                .Include(u => u.ReportUsers)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }

}
