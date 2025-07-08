namespace ServerSide.DTOs.News
{
    public class NewsDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
    }
}
