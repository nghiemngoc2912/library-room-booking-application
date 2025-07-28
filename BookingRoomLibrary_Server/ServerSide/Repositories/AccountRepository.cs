using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public AccountRepository(LibraryRoomBookingContext context)
        {
            this._context = context;
        }

        public async Task<Account> UpdateLibrarianAsync(Account account, User user)
        {
            _context.Accounts.Update(account);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<Account> CreateLibrarianAsync(Account account, User user)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                user.AccountId = account.Id;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return account;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Account?> GetAccountByIdAsync(int id)
        {
            return await _context.Accounts
                .Include(a => a.Users)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Account?> GetAccountStaffByIdAsync(int id)
        {
            return await _context.Accounts
                .Include(a => a.Users)
                .FirstOrDefaultAsync(a => a.Id == id && a.Role == (byte)Roles.Staff);
        }

        public async Task<Account?> GetAccountByUsernameAsync(string username)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Username == username);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Account)
                .FirstOrDefaultAsync(u => u.Account.Username == email);
        }


        public async Task UpdateAccountStatusAsync(int id, byte status)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null || account.Role != (byte)Roles.Staff)
                throw new Exception("Librarian not found");

            account.Status = status;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAccountAsync(int id)
        {
            var account = await _context.Accounts
                .Include(a => a.Users)
                .FirstOrDefaultAsync(a => a.Id == id && a.Role == (byte)Roles.Staff);

            if (account == null)
                throw new Exception("Librarian not found");

            _context.Users.RemoveRange(account.Users);
            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
        }

        public IQueryable<Account> GetLibrarians(string? keyword, byte? status)
        {
            var query = _context.Accounts
                .Include(a => a.Users)
                .Where(a => a.Role == (byte)Roles.Staff);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(a =>
                    a.Users.Any(u =>
                        u.FullName.Contains(keyword) ||
                        u.Code.Contains(keyword)) ||
                    a.Username.Contains(keyword) 
                );
            }

            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            return query;
        }


        public async Task<User> GetUserByAccountIdAsync(int accountId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.AccountId == accountId);
        }

        public async Task<User> GetLatestStudentAsync()
        {
            return await _context.Users
                .Where(u => u.Code != null && u.Code.StartsWith("ST"))
                .OrderByDescending(u => u.Code)
                .FirstOrDefaultAsync();
        }

        public async Task<List<User>> GetStudentsWithSTCodeAsync()
        {
            return await _context.Users
                .Where(u => u.Code != null && u.Code.StartsWith("ST"))
                .ToListAsync();
        }
    }

    public interface IAccountRepository
    {
        Task<Account> CreateLibrarianAsync(Account account, User user);
        Task<Account?> GetAccountByIdAsync(int id);
        Task<Account?> GetAccountStaffByIdAsync(int id);
        Task<Account?> GetAccountByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task UpdateAccountStatusAsync(int id, byte status);
        Task DeleteAccountAsync(int id);
        IQueryable<Account> GetLibrarians(string? keyword, byte? status);
        Task<Account> UpdateLibrarianAsync(Account account, User user);
        Task<User> GetUserByAccountIdAsync(int accountId);
        Task<User?> GetLatestStudentAsync();
        Task<List<User>> GetStudentsWithSTCodeAsync();
    }
}