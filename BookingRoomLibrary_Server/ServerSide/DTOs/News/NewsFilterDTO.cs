namespace ServerSide.DTOs.News
{
    public class NewsFilterDTO
    {
        public string? Keyword { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SortBy { get; set; } = "CreatedDate";
        public bool IsAsc { get; set; } = false;
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 5;
    }
}
