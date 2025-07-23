using ServerSide.DTOs.Student;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;

        public StudentService(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<IEnumerable<StudentDTO>> GetRelatedStudentsAsync(int userId)
        {
            var students = await _studentRepository.GetRelatedStudentsAsync(userId);

            return students.Select(s => new StudentDTO
            {
                Id = s.Id,
                FullName = s.FullName ?? string.Empty,
                Reputation = s.Reputation
            });
        }

        public async Task SubtractReputationAsync(int userId, int change, string reason)
        {
            var user = await _studentRepository.GetUserByIdAsync(userId);
            int newReputation = (user.Reputation ?? 0) + change;
            if (newReputation < 0) newReputation = 0;

            user.Reputation = newReputation;
            await _studentRepository.UpdateUserAsync(user);
        }

        public async Task SubtractReputationFromRelatedStudentsAsync(int reporterUserId, int change, string reason)
        {
            var students = await _studentRepository.GetRelatedStudentsAsync(reporterUserId);

            foreach (var student in students)
            {
                if (student.Id == reporterUserId)
                    continue;

                int newReputation = (student.Reputation ?? 0) + change;
                if (newReputation < 0) newReputation = 0;

                student.Reputation = newReputation;
                await _studentRepository.UpdateUserAsync(student);
            }
        }
    }

    public interface IStudentService
    {
        Task<IEnumerable<StudentDTO>> GetRelatedStudentsAsync(int userId);
        Task SubtractReputationAsync(int userId, int change, string reason);
        Task SubtractReputationFromRelatedStudentsAsync(int reporterUserId, int change, string reason);
    }
}
