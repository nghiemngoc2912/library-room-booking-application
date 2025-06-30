using ServerSide.Models;

namespace ServerSide.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserWithReports(int userId);
    }
}
