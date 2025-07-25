using Microsoft.Extensions.Options;
using ServerSide.Constants;
using ServerSide.DTOs.Student;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly ReputationConfig config;

        public StudentService(IStudentRepository studentRepository,IOptions<ReputationConfig> options)
        {
            _studentRepository = studentRepository ?? throw new ArgumentNullException(nameof(studentRepository));
            config = options.Value;
        }

        public async Task<IEnumerable<StudentDTO>> GetRelatedStudentsAsync(int userId)
        {
            var students = await _studentRepository.GetRelatedStudentsAsync(userId);
            return students.Select(s => new StudentDTO
            {
                StudentId = s.Id,
                FullName = s.FullName,
                Reputation = s.Reputation ?? 0
            });
        }

        public async Task SubtractReputationAsync(int userId, int change, string reason)
        {
            var user = await _studentRepository.GetUserByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");
            int newReputation = (user.Reputation ?? 0) + change; // Sử dụng change để trừ đúng số điểm
            if (newReputation < 0) newReputation = 0; // Ngăn reputation âm
            user.Reputation = newReputation;
            await _studentRepository.UpdateUserAsync(user);
        }

        public void UpdateReputation()
        {
            Console.WriteLine($"Reputation job is running at {DateTime.Now}");
            //get list student reputation <100 >50
            var students = _studentRepository.GetStudentsListByReputation(config.MinReputationToAdd,config.MaxReputationToAdd);
            foreach (var student in students)
            {
                student.Reputation += config.AddReputation;
                _studentRepository.Update(student);
            }
            _studentRepository.Save();
        }
    }

    public interface IStudentService
    {
        Task<IEnumerable<StudentDTO>> GetRelatedStudentsAsync(int userId);
        Task SubtractReputationAsync(int userId, int change, string reason);
        void UpdateReputation();
    }
}