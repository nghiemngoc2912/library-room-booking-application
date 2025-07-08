using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.DTOs.Booking;
using ServerSide.DTOs.User;
using ServerSide.Models;
using ServerSide.Repositories;
using System.Data;
using Microsoft.EntityFrameworkCore;

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
            return repository.SearchUserByCode(code).Select(s=>new UserBookingDTO(s));
        }

        User IUserService.GetUserByCode(string s)
        {
            return repository.GetUserByCode(s);
        }

        User IUserService.GetUserById(int id)
        {
            return repository.GetUserById(id);
        }
        public PageResultDTO<StudentListDTO> GetAllStudents(string? keyword, int page, int pageSize)
        {
            var query = repository.GetUsersByRole(Roles.Student, keyword);

            int totalItems = query.Count();

            var students = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(u => u.Account)
                .ToList();

            var studentDtos = students.Select(u => new StudentListDTO
            {
                Id = u.Id,
                FullName = u.FullName,
                Code = u.Code,
                Email = u.Email,
                Status = u.Account.Status == 1 ? "Active" : "Inactive"
            }).ToList();

            return new PageResultDTO<StudentListDTO>
            {
                Items = studentDtos,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }
    }
    public interface IUserService
    {
        User GetUserByCode(string s);
        IEnumerable<UserBookingDTO> SearchUserByCode(string code);
        User GetUserById(int id);
        PageResultDTO<StudentListDTO> GetAllStudents(string? keyword, int page, int pageSize);
    }
}
