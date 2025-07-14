namespace ServerSide.DTOs.News
{
    public class CreateNewsDTO
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int CreatedBy { get; set; }
    }
}
