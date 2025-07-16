using ServerSide.Models;
namespace ServerSide.DTOs.Booking
{
    public class UserBookingDTO
    {
        public string FullName { get; set; } = null!;
        public string Code { get; set; } = null!;

        public UserBookingDTO(ServerSide.Models.User user)
        {
            FullName = user.FullName;
            Code = user.Code;
        }
    }
}