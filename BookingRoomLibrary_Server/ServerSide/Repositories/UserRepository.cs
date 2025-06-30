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
