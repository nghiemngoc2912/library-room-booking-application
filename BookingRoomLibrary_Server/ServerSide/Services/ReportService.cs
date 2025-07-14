using ServerSide.DTOs.Report;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository ?? throw new ArgumentNullException(nameof(reportRepository));
        }

        public async Task<ReportDTO> GetReportByIdAsync(int id)
        {
            var report = await _reportRepository.GetReportByIdAsync(id);
            return MapToDto(report);
        }

        public async Task<IEnumerable<ReportDTO>> GetAllReportsAsync()
        {
            var reports = await _reportRepository.GetAllReportsAsync();
            return reports.Select(MapToDto);
        }

        public async Task CreateReportAsync(ReportDTO reportDto)
        {
            if (reportDto == null) throw new ArgumentNullException(nameof(reportDto));
            if (reportDto.RuleId <= 0) throw new ArgumentException("Rule ID is required.");
            if (string.IsNullOrWhiteSpace(reportDto.ReportType)) throw new ArgumentException("Report type is required.");

            var report = MapToEntity(reportDto);
            await _reportRepository.CreateReportAsync(report);
        }

        public async Task UpdateReportAsync(ReportDTO reportDto)
        {
            if (reportDto == null) throw new ArgumentNullException(nameof(reportDto));
            if (reportDto.RuleId <= 0) throw new ArgumentException("Rule ID is required.");
            if (string.IsNullOrWhiteSpace(reportDto.ReportType)) throw new ArgumentException("Report type is required.");

            var report = MapToEntity(reportDto);
            await _reportRepository.UpdateReportAsync(report);
        }

        public async Task UpdateReportStatusAsync(int id, byte? status)
        {
            var existingReport = await _reportRepository.GetReportByIdAsync(id);
            if (existingReport == null) throw new KeyNotFoundException($"Report with ID {id} not found.");

            existingReport.Status = status ?? existingReport.Status; // Chỉ cập nhật nếu status có giá trị
            await _reportRepository.UpdateReportAsync(existingReport);
        }

        public async Task DeleteReportAsync(int id)
        {
            await _reportRepository.DeleteReportAsync(id);
        }

        private ReportDTO MapToDto(Report report)
        {
            return new ReportDTO
            {
                Id = report.Id,
                RuleId = report.RuleId,
                ReportType = report.ReportType,
                Description = report.Description,
                Status = report.Status,
                CreateAt = report.CreateAt,
                UserId = report.UserId,
                ResolvedAt = report.ResolvedAt,
                ResolvedBy = report.ResolvedBy,
                RoomId = report.RoomId,
                UserName = report.User?.FullName
            };
        }

        private Report MapToEntity(ReportDTO reportDto)
        {
            return new Report
            {
                Id = reportDto.Id,
                RuleId = reportDto.RuleId,
                ReportType = reportDto.ReportType,
                Description = reportDto.Description,
                Status = reportDto.Status,
                CreateAt = reportDto.CreateAt ?? DateTime.UtcNow,
                UserId = reportDto.UserId,
                ResolvedAt = reportDto.ResolvedAt,
                ResolvedBy = reportDto.ResolvedBy,
                RoomId = reportDto.RoomId
            };
        }
    }
    public interface IReportService
    {
        Task<ReportDTO> GetReportByIdAsync(int id);
        Task<IEnumerable<ReportDTO>> GetAllReportsAsync();
        Task CreateReportAsync(ReportDTO reportDto);
        Task UpdateReportAsync(ReportDTO reportDto);
        Task UpdateReportStatusAsync(int id, byte? status);
        Task DeleteReportAsync(int id);
    }
}