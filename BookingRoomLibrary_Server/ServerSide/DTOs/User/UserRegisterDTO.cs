using ServerSide.Constants;
using ServerSide.Models;

namespace ServerSide.DTOs.User
{
    public class UserRegisterDTO
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public DateOnly? Dob { get; set; }
        public string? Email { get; set; }
        public Models.Account ToAccount(string passwordHash, byte role)
        {
            return new Models.Account
            {
                Username = Username,
                PasswordHash = passwordHash,
                Role = (byte) role,       // 1 = Student
                Status = 1      // 1 = Active
            };
        }
        public Models.User ToUser(int accountId)
        {
            return new Models.User
            {
                FullName = FullName,
                Dob = Dob,
                Email = Email,
                AccountId = accountId
            };
        }
    }
}
