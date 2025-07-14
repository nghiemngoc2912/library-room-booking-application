namespace ServerSide.DTOs.Room
{
    public class UpdateRoomDTO
    {
        public int Id { get; set; }
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public byte Status { get; set; }

        // Parameterless constructor for deserialization
        public UpdateRoomDTO()
        {
        }

        // Constructor for mapping from Room
        public UpdateRoomDTO(ServerSide.Models.Room room)
        {
            if (room != null)
            {
                Id = room.Id;
                RoomName = room.RoomName;
                Capacity = room.Capacity;
                Status = room.Status;
            }
        }
    }
}   