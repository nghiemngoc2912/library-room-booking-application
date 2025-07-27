using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public ReportRepository(LibraryRoomBookingContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Report> GetReportByIdAsync(int id)
        {
            return await _context.Reports
                .Include(r => r.User)
                .Include(r => r.Rule)
                .Include(r => r.Room)
                .Include(r => r.StartSlot)
                .Include(r => r.EndSlot)
                .FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException($"Report with ID {id} not found.");
        }

        public async Task<IEnumerable<Report>> GetAllReportsAsync()
        {
            return await _context.Reports
                .Include(r => r.User)
                .Include(r => r.Rule)
                .Include(r => r.Room)
                .Include(r => r.StartSlot)
                .Include(r => r.EndSlot)
                .ToListAsync();
        }

        public async Task CreateReportAsync(Report report)
        {
            if (report == null) throw new ArgumentNullException(nameof(report));
            report.CreateAt = DateTime.UtcNow; // Đặt thời gian tạo mặc định
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateReportAsync(Report report)
        {
            if (report == null) throw new ArgumentNullException(nameof(report));
            var existingReport = await _context.Reports.FindAsync(report.Id);
            if (existingReport == null) throw new KeyNotFoundException($"Report with ID {report.Id} not found.");

            // Cập nhật tất cả các trường, bao gồm StartSlotId và EndSlotId
            existingReport.RuleId = report.RuleId;
            existingReport.ReportType = report.ReportType;
            existingReport.Description = report.Description;
            existingReport.Status = report.Status;
            existingReport.CreateAt = report.CreateAt;
            existingReport.UserId = report.UserId;
            existingReport.ResolvedAt = report.ResolvedAt;
            existingReport.ResolvedBy = report.ResolvedBy;
            existingReport.RoomId = report.RoomId;
            existingReport.StartSlotId = report.StartSlotId;
            existingReport.EndSlotId = report.EndSlotId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteReportAsync(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) throw new KeyNotFoundException($"Report with ID {id} not found.");

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
        }
    }

    public interface IReportRepository
    {
        Task<Report> GetReportByIdAsync(int id);
        Task<IEnumerable<Report>> GetAllReportsAsync();
        Task CreateReportAsync(Report report);
        Task UpdateReportAsync(Report report);
        Task DeleteReportAsync(int id);
    }
}