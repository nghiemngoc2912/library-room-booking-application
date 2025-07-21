namespace ServerSide.DTOs.Rating
{
    public class CreateRatingDTO
    {
        public int StudentId { get; set; }
        public int RatingValue { get; set; }
        public string? Comment { get; set; }
    }
}
