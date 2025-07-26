using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly LibraryRoomBookingContext context;

        public AccountRepository(LibraryRoomBookingContext context)
        {
            this.context = context;
        }

        public async Task<Account> UpdateLibrarianAsync(Account account, User user)
        {
            context.Accounts.Update(account);
            context.Users.Update(user);
            await context.SaveChangesAsync();
            return account;
        }

        public async Task<Account> CreateLibrarianAsync(Account account, User user)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                context.Accounts.Add(account);
                await context.SaveChangesAsync();

                user.AccountId = account.Id;
                context.Users.Add(user);
                await context.SaveChangesAsync();

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
            return await context.Accounts
                .Include(a => a.Users)
                .FirstOrDefaultAsync(a => a.Id == id && a.Role == (byte)Roles.Staff);
        }

        public async Task<Account?> GetAccountByUsernameAsync(string username)
        {
            return await context.Accounts
                .FirstOrDefaultAsync(a => a.Username == username);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task UpdateAccountStatusAsync(int id, byte status)
        {
            var account = await context.Accounts.FindAsync(id);
            if (account == null || account.Role != (byte)Roles.Staff)
                throw new Exception("Librarian not found");

            account.Status = status;
            await context.SaveChangesAsync();
        }

        public async Task DeleteAccountAsync(int id)
        {
            var account = await context.Accounts
                .Include(a => a.Users)
                .FirstOrDefaultAsync(a => a.Id == id && a.Role == (byte)Roles.Staff);

            if (account == null)
                throw new Exception("Librarian not found");

            context.Users.RemoveRange(account.Users);
            context.Accounts.Remove(account);
            await context.SaveChangesAsync();
        }

        // ServerSide/Repositories/AccountRepository.cs
        public IQueryable<Account> GetLibrarians(string? keyword, byte? status)
        {
            var query = context.Accounts
                .Include(a => a.Users) // Include Users first
                .Where(a => a.Role == (byte)Roles.Staff); // Filter by Staff role

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(a =>
                    a.Users.Any(u => u.FullName.Contains(keyword) ||
                                     u.Email.Contains(keyword) ||
                                     u.Code.Contains(keyword)));
            }

            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            return query;
        }

        public async Task<User> GetUserByAccountIdAsync(int accountId)
        {
            return await context.Users.FirstOrDefaultAsync(u => u.AccountId == accountId);
        }
    }


    public interface IAccountRepository
    {
        Task<Account> CreateLibrarianAsync(Account account, User user);
        Task<Account?> GetAccountByIdAsync(int id);
        Task<Account?> GetAccountByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task UpdateAccountStatusAsync(int id, byte status);
        Task DeleteAccountAsync(int id);
        IQueryable<Account> GetLibrarians(string? keyword, byte? status);
        Task<Account> UpdateLibrarianAsync(Account account, User user);
        Task<User> GetUserByAccountIdAsync(int accountId);
    }
}
