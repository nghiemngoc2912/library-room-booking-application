using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public AccountRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
        }

        async Task<bool> IAccountRepository.ExistsByUsernameAsync(string username)
        {
            return await _context.Accounts.AnyAsync(a => a.Username == username);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
    public interface IAccountRepository
    {
        Task<bool> ExistsByUsernameAsync(string username);
        Task AddAsync(Account account);
        Task SaveChangesAsync();
    }
}
