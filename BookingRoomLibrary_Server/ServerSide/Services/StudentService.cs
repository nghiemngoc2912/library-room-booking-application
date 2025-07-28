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
        private readonly IEmailService _emailService;

        public StudentService(IStudentRepository studentRepository,IOptions<ReputationConfig> options, IEmailService emailService)
        {
            _studentRepository = studentRepository ?? throw new ArgumentNullException(nameof(studentRepository));
            config = options.Value;
            _emailService = emailService;
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

            // Send email notification to the user
            await _emailService.SendReputationChangeEmailAsync(
                user.Account.Username,
                user.FullName,
                newReputation,
                change,
                reason
            );
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

                // Send email notification to each related student
                await _emailService.SendReputationChangeEmailAsync(
                    student.Account.Username,
                    student.FullName,
                    newReputation,
                    change,
                    reason
                );
            }
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
        Task SubtractReputationFromRelatedStudentsAsync(int reporterUserId, int change, string reason);
    }
}
