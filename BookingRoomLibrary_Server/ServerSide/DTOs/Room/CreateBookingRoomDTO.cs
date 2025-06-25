namespace ServerSide.DTOs.Room
{
    public class CreateBookingRoomDTO
    {
        public int Id { get; set; }
        public string RoomName { get; set; } = null!;
        public int Capacity { get; set; }
        public CreateBookingRoomDTO(Models.Room room)
        {
            RoomName = room.RoomName;
            Id = room.Id;
            Capacity = room.Capacity;
        }
    }
}
