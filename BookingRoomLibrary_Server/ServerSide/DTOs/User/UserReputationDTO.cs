namespace ServerSide.DTOs.User;
public class UserReputationDTO
{
    public string FullName { get; set; } = null!;
    public int Reputation { get; set; }
    public List<ViolationStat> Violations { get; set; } = new();

    public int TotalPenalty => Violations.Sum(v => v.Score);

    public class ViolationStat
    {
        public string Type { get; set; } = null!;
        public int Count { get; set; }
        public int Score { get; set; }
    }
}
