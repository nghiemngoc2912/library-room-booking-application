using ServerSide.DTOs.Booking;
using ServerSide.DTOs.User;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository repository;

        public UserService(IUserRepository repository)
        {
            this.repository = repository;
        }

        public IEnumerable<UserBookingDTO> SearchUserByCode(string code)
        {
            return repository.SearchUserByCode(code).Select(s => new UserBookingDTO(s));
        }

        public User GetUserByCode(string s)
        {
            return repository.GetUserByCode(s);
        }

        public async Task<UserReputationDTO?> GetUserReputationAsync(int userId)
        {
            var user = await repository.GetUserWithReports(userId);
            if (user == null) return null;

            var violations = user.ReportUsers
                .GroupBy(r => r.ReportType)
                .Select(g => new UserReputationDTO.ViolationStat
                {
                    Type = g.Key ?? "Unknown",
                    Count = g.Count(),
                    Score = g.Count() * -5
                }).ToList();

            var totalPenalty = violations.Sum(v => v.Score);
            var reputation = 100 + totalPenalty;
            reputation = Math.Clamp(reputation, 0, 100);

            return new UserReputationDTO
            {
                FullName = user.FullName,
                Reputation = reputation,
                Violations = violations
            };
        }
    }

    public interface IUserService
    {
        User GetUserByCode(string s);
        IEnumerable<UserBookingDTO> SearchUserByCode(string code);
        Task<UserReputationDTO?> GetUserReputationAsync(int userId);
        
    }
}
