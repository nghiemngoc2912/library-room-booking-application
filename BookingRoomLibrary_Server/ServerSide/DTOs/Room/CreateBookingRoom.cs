namespace ServerSide.DTOs.Room
{
    public class CreateBookingRoom
    {
        public int Id { get; set; }
        public string RoomName { get; set; } = null!;
        public CreateBookingRoom(Models.Room room)
        {
            RoomName = room.RoomName;
            Id = room.Id;
        }
    }
}
