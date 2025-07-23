using Org.BouncyCastle.Crypto.Generators;
using ServerSide.DTOs.User;
using ServerSide.Repositories;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace ServerSide.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepo;
        private readonly IUserRepository _userRepo;

        public AccountService(IAccountRepository accountRepo, IUserRepository userRepo)
        {
            _accountRepo = accountRepo;
            _userRepo = userRepo;
        }

        async Task IAccountService.RegisterAsync(UserRegisterDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || dto.Username.Length < 4)
                throw new Exception("Username must have at least 4 chars");

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
                throw new Exception("Password must have at least 6 chars");

            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new Exception("Full name cannot be empty");

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
                if (!Regex.IsMatch(dto.Email, emailPattern))
                    throw new Exception("Email invalid");
            }
            if (dto.Dob != null)
            {
                var dob = dto.Dob.Value;

                if (dob > DateOnly.FromDateTime(DateTime.Today))
                    throw new Exception("Dob In the future");

                if (dob < new DateOnly(1990, 1, 1))
                    throw new Exception("Dob before 1990");

                var today = DateOnly.FromDateTime(DateTime.Today);
                int age = today.Year - dob.Year;
                if (dob > today.AddYears(-age)) age--; // điều chỉnh nếu chưa đến sinh nhật

                if (age < 16)
                    throw new Exception("You need to be above 16.");
            }
            if (await _accountRepo.ExistsByUsernameAsync(dto.Username))
                throw new Exception("Username exists");

            var passwordHash = ComputeHash(dto.Password);

            var account = dto.ToAccount(passwordHash);
            await _accountRepo.AddAsync(account);
            await _accountRepo.SaveChangesAsync();

            var user = dto.ToUser(account.Id);
            await _userRepo.AddAsync(user);
        }

        private string ComputeHash(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
    public interface IAccountService
    {
        Task RegisterAsync(UserRegisterDTO dto);
    }
}
