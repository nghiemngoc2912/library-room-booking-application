using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public AuthRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public Account GetAccountByUsername(string username)
        {
            return _context.Accounts
                .FirstOrDefault(a => a.Username == username && a.Status == 1); // Status 1 = active
        }
    }

    public interface IAuthRepository
    {
        Account GetAccountByUsername(string username);
    }
}
