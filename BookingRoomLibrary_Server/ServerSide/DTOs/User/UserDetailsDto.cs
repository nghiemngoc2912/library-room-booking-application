namespace ServerSide.DTOs.User
{
    public class UserDetailsDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public DateOnly? Dob { get; set; }
        public string Email { get; set; } = null!; 
        public DateTime CreatedDate { get; set; } 
    }
}