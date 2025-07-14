namespace ServerSide.DTOs.Rule
{
    public class RuleDTO
    {

        public int Id { get; set; }
        public string RuleName { get; set; } = null!;
        public string? Description { get; set; }
        public byte? Status { get; set; }
        public DateTime? CreateAt { get; set; }
        public int UserId { get; set; }
    }
}