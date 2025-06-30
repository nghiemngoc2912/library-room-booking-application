using ServerSide.DTOs.User;

public interface IUserService
{
    Task<UserReputationDTO?> GetUserReputationAsync(int userId);
}
