using ServerSide.Models;
using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;

namespace ServerSide.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public AuthRepository(LibraryRoomBookingContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public Account GetAccountByUsername(string username)
        {
            Console.WriteLine($"GetAccountByUsername: {username}");

            return _context.Accounts
                .FirstOrDefault(a => a.Username == username);
        }

        public async Task<Account> GetAccountByUserIdAsync(int userId)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == userId && a.Status == 1); 
        }

        public async Task UpdateAccountAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public int GetUserIdByAccountId(int accountId)
        {
            var user = _context.Users.FirstOrDefault(u => u.AccountId == accountId);

            if (user == null)
                throw new Exception("User not found for this account.");

            return user.Id;
        }

    }

    public interface IAuthRepository
    {
        Account GetAccountByUsername(string username);
        Task<Account> GetAccountByUserIdAsync(int userId); 
        Task UpdateAccountAsync(Account account);
        int GetUserIdByAccountId(int accountId);
    }
}