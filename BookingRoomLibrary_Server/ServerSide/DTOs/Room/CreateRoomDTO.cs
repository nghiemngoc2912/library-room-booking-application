namespace ServerSide.DTOs.Room
{
    public class CreateRoomDTO
    {
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public byte Status { get; set; }

        // Parameterless constructor for deserialization
        public CreateRoomDTO()
        {
        }
    }
}