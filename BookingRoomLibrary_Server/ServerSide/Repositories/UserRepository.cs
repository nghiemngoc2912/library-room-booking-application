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
    }
}
