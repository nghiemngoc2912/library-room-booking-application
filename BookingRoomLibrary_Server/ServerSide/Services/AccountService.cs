using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Generators;
using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.DTOs.Account;
using ServerSide.Models;
using ServerSide.Repositories;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace ServerSide.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository repository;
        private readonly IAuthService authService; 

        public AccountService(IAccountRepository repository, IAuthService authService)
        {
            this.repository = repository;
            this.authService = authService;
        }

        public async Task<AccountDTO> CreateLibrarianAsync(CreateAccountDTO dto)
        {
            // Validate username is email format
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(dto.Username))
            {
                throw new ArgumentException("Username phải là một địa chỉ email hợp lệ.");
            }

            // Validate password length
            if (dto.Password.Length < 8)
            {
                throw new ArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");
            }

            // Validate username doesn't exist
            var existingAccount = await repository.GetAccountByUsernameAsync(dto.Username);
            if (existingAccount != null)
            {
                throw new ArgumentException("Username đã tồn tại.");
            }

            var account = new Account
            {
                Username = dto.Username,
                PasswordHash = authService.ComputeHash(dto.Password),
                Role = (byte)Roles.Staff,
                Status = (byte)AccountStatus.Active
            };

            var user = new User
            {
                FullName = dto.FullName,
                Dob = dto.Dob,
                Code = dto.Code,
                Reputation = 0
            };

            var createdAccount = await repository.CreateLibrarianAsync(account, user);

            return new AccountDTO
            {
                Id = createdAccount.Id,
                Username = createdAccount.Username,
                FullName = user.FullName,
                Dob = user.Dob,
                Code = user.Code,
                Status = createdAccount.Status == 1 ? "Active" : "Inactive"
            };
        }

        // ServerSide/Services/AccountService.cs (partial, focusing on UpdateLibrarianAsync)
        public async Task<AccountDTO> UpdateLibrarianAsync(int id, CreateAccountDTO dto)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(dto.Username))
            {
                throw new ArgumentException("Username must be a valid email address.");
            }

            if (!string.IsNullOrEmpty(dto.Password) && dto.Password.Length < 8)
            {
                throw new ArgumentException("Password must be at least 8 characters long.");
            }

            var existingAccount = await repository.GetAccountStaffByIdAsync(id);
            if (existingAccount == null)
            {
                throw new ArgumentException("Staff member not found.");
            }

            var accountByUsername = await repository.GetAccountByUsernameAsync(dto.Username);
            if (accountByUsername != null && accountByUsername.Id != id)
            {
                throw new ArgumentException("Username already exists.");
            }

            existingAccount.Username = dto.Username;
            if (!string.IsNullOrEmpty(dto.Password))
            {
                existingAccount.PasswordHash = authService.ComputeHash(dto.Password);
            }

            var user = await repository.GetUserByAccountIdAsync(id);
            if (user == null)
            {
                throw new ArgumentException("User data not found.");
            }

            user.FullName = dto.FullName;
            user.Dob = dto.Dob;
            user.Code = dto.Code;

            await repository.UpdateLibrarianAsync(existingAccount, user);

            return new AccountDTO
            {
                Id = existingAccount.Id,
                Username = existingAccount.Username,
                FullName = user.FullName,
                Dob = user.Dob,
                Code = user.Code,
                Status = existingAccount.Status == 1 ? "Active" : "Inactive"
            };
        }

        public async Task<AccountDTO?> GetLibrarianByIdAsync(int id)
        {
            var account = await repository.GetAccountStaffByIdAsync(id);
            if (account == null) return null;

            var user = account.Users.FirstOrDefault();
            return new AccountDTO
            {
                Id = account.Id,
                Username = account.Username,
                FullName = user?.FullName,
                Dob = user?.Dob,
                Code = user?.Code,
                Status = account.Status == 1 ? "Active" : "Inactive"
            };
        }

        public async Task UpdateLibrarianStatusAsync(UpdateAccountStatusDTO dto)
        {
            await repository.UpdateAccountStatusAsync(dto.Id, dto.Status);
        }

        public async Task DeleteLibrarianAsync(int id)
        {
            await repository.DeleteAccountAsync(id);
        }

        public PageResultDTO<AccountDTO> GetAllLibrarians(string? keyword, byte? status, int page, int pageSize)
        {
            var query = repository.GetLibrarians(keyword, status);
            int totalItems = query.Count();

            var accounts = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var accountDtos = accounts.Select(a => new AccountDTO
            {
                Id = a.Id,
                Username = a.Username,
                FullName = a.Users.FirstOrDefault()?.FullName,
                Dob = a.Users.FirstOrDefault()?.Dob,
                Code = a.Users.FirstOrDefault()?.Code,
                Status = a.Status == 1 ? "Active" : "Inactive"
            }).ToList();

            return new PageResultDTO<AccountDTO>
            {
                Items = accountDtos,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }
    }

    public interface IAccountService
    {
        Task<AccountDTO> CreateLibrarianAsync(CreateAccountDTO dto);
        Task<AccountDTO?> GetLibrarianByIdAsync(int id);
        Task UpdateLibrarianStatusAsync(UpdateAccountStatusDTO dto);
        Task DeleteLibrarianAsync(int id);
        PageResultDTO<AccountDTO> GetAllLibrarians(string? keyword, byte? status, int page, int pageSize);
        Task<AccountDTO> UpdateLibrarianAsync(int id, CreateAccountDTO dto);
    }
}
