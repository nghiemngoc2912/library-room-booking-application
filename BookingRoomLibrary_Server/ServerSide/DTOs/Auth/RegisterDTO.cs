namespace ServerSide.DTOs.Auth
{
    public class CreateAccountStudentDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public DateOnly? Dob { get; set; }
    }

    public class VerifyOtpDTO
    {
        public string Username { get; set; }
        public string OtpCode { get; set; }
    }
    public class PendingRegistration
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public DateTime? Dob { get; set; }
        public string StudentCode { get; set; } // Thêm thuộc tính để lưu mã sinh viên
    }


}