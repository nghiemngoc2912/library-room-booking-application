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

        User IUserService.GetUserByCode(string s)
        {
            return repository.GetUserByCode(s);
        }
    }
    public interface IUserService
    {
        User GetUserByCode(string s);
    }
}
