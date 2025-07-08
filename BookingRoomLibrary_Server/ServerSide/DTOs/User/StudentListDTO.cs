namespace ServerSide.DTOs.User
{
    public class StudentListDTO
    {
        public int Id { get; set; }                  // để dùng khi click View History
        public string FullName { get; set; }
        public string Code { get; set; }
        public string? Email { get; set; }
        public string Status { get; set; }
    }
}
