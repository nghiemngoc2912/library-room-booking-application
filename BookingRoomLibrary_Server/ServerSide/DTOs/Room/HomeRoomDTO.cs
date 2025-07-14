using ServerSide.Models;

namespace ServerSide.DTOs.Room
{
    public class HomeRoomDTO
    {
        public int Id { get; set; }

        public string RoomName { get; set; } = null!;

        public byte Status { get; set; }
        public HomeRoomDTO(ServerSide.Models.Room room)
        {
            this.RoomName = room.RoomName;
            this.Status = room.Status;
            this.Id= room.Id;
        }
    }
}
