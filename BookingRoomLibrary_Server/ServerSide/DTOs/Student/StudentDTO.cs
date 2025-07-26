namespace ServerSide.DTOs.Student
{
    public class StudentDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int? Reputation { get; set; }
    }

}
