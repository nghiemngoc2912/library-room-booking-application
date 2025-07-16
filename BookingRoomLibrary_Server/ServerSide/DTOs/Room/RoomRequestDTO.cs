using ServerSide.Models;

namespace ServerSide.DTOs.Room
{
    public class RoomRequestDTO
    {
        public int Id { get; set; }
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public byte Status { get; set; }

        public RoomRequestDTO() { }

        public RoomRequestDTO(ServerSide.Models.Room room)
        {
            Id = room.Id;
            RoomName = room.RoomName;
            Capacity = room.Capacity;
            Status = room.Status;
        }
    }
}