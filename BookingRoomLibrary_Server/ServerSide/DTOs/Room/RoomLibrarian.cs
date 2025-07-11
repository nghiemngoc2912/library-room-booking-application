namespace ServerSide.DTOs.Room
{
    public class RoomLibrarian
    {
        public int Id { get; set; }
        public string RoomName { get; set; } = null!;
        public byte Status { get; set; }
        public int Capacity { get; set; }

        public int StatusAsInt => (Status == 254) ? -2 : (Status == 255) ? -1 : Status;

        public RoomLibrarian(ServerSide.Models.Room room)
        {
            this.Id = room.Id;
            this.RoomName = room.RoomName;
            this.Status = room.Status;
            this.Capacity = room.Capacity;
        }
    }
}