using ServerSide.DTOs.User;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository repo;

        public UserService(IUserRepository repo)
        {
            this.repo = repo;
        }

        public async Task<UserReputationDTO?> GetUserReputationAsync(int userId)
        {
            var user = await repo.GetUserWithReports(userId);
            if (user == null) return null;

            var violations = user.ReportUsers
                .GroupBy(r => r.ReportType)
                .Select(g => new UserReputationDTO.ViolationStat
                {
                    Type = g.Key ?? "Unknown",
                    Count = g.Count(),
                    Score = g.Count() * -5
                }).ToList();

            // ✅ Tính lại điểm reputation
            var totalPenalty = violations.Sum(v => v.Score);
            var reputation = 100 + totalPenalty;
            reputation = Math.Clamp(reputation, 0, 100); // giới hạn 0–100

            return new UserReputationDTO
            {
                FullName = user.FullName,
                Reputation = reputation,
                Violations = violations
            };
        }
    }
}
