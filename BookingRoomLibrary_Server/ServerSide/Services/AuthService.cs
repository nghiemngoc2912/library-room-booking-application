using ServerSide.DTOs.Auth;
using ServerSide.Models;
using ServerSide.Repositories;
using System.Security.Cryptography;
using System.Text;

namespace ServerSide.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public Account Authenticate(LoginDTO loginDto)
        {
            var account = _authRepository.GetAccountByUsername(loginDto.Username);
            if (account == null)
            {
                return null;
            }

            // Verify password
            var inputPasswordHash = ComputeHash(loginDto.Password);
            if (inputPasswordHash != account.PasswordHash)
            {
                return null;
            }

            return account;
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

    public interface IAuthService
    {
        Account Authenticate(LoginDTO loginDto);
    }
}
