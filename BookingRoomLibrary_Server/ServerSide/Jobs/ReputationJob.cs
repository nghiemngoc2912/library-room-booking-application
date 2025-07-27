using ServerSide.Services;

namespace ServerSide.Jobs
{
    public class ReputationJob
    {
        private readonly IStudentService _studentService;

        public ReputationJob(IStudentService studentService)
        {
            _studentService = studentService;
        }
        public void UpdateReputation()
        {
            
            _studentService.UpdateReputation();
        }
    }
}
