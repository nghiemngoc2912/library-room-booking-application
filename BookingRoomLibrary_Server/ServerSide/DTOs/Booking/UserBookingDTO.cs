using ServerSide.Models;

namespace ServerSide.DTOs.Booking
{
    public class UserBookingDTO
    {
        public string FullName { get; set; } = null!;
        public string Code { get; set; }
        public UserBookingDTO(User user) {
            this.FullName = user.FullName;
            this.Code = user.Code;
        }
    }
}
