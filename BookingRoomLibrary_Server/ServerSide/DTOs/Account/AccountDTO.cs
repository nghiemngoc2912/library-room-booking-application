namespace ServerSide.DTOs.Account
{
    public class AccountDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Status { get; set; }
        public DateOnly? Dob { get; set; }
        public string? Code { get; set; }
    }

    public class CreateAccountDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public DateOnly? Dob { get; set; }
        public string? Code { get; set; }
    }

    public class UpdateAccountStatusDTO
    {
        public int Id { get; set; }
        public byte Status { get; set; }
    }
}