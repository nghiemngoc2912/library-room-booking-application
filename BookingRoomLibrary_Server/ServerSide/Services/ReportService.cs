using ServerSide.DTOs.Report;
using ServerSide.Models;
using ServerSide.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ServerSide.DTOs;

namespace ServerSide.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly LibraryRoomBookingContext _context;

        public ReportService(IReportRepository reportRepository, LibraryRoomBookingContext context)
        {
            _reportRepository = reportRepository ?? throw new ArgumentNullException(nameof(reportRepository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
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

            // Validate StartSlotId and EndSlotId
            if (reportDto.StartSlotId <= 0 || reportDto.EndSlotId <= 0)
                throw new ArgumentException("Slot IDs must be positive.");
            if (reportDto.StartSlotId > reportDto.EndSlotId)
                throw new ArgumentException("StartSlotId must be less than or equal to EndSlotId.");
            var startSlot = await _context.Slots.FindAsync(reportDto.StartSlotId);
            var endSlot = await _context.Slots.FindAsync(reportDto.EndSlotId);
            if (startSlot == null || endSlot == null)
                throw new ArgumentException("Invalid Slot ID.");

            var report = MapToEntity(reportDto);
            await _reportRepository.CreateReportAsync(report);
        }

        public async Task UpdateReportAsync(ReportDTO reportDto)
        {
            if (reportDto == null) throw new ArgumentNullException(nameof(reportDto));
            if (reportDto.Id <= 0) throw new ArgumentException("Report ID is required.");
            if (reportDto.RuleId <= 0) throw new ArgumentException("Rule ID is required.");
            if (string.IsNullOrWhiteSpace(reportDto.ReportType)) throw new ArgumentException("Report type is required.");

            // Validate StartSlotId and EndSlotId
            if (reportDto.StartSlotId <= 0 || reportDto.EndSlotId <= 0)
                throw new ArgumentException("Slot IDs must be positive.");
            if (reportDto.StartSlotId > reportDto.EndSlotId)
                throw new ArgumentException("StartSlotId must be less than or equal to EndSlotId.");
            var startSlot = await _context.Slots.FindAsync(reportDto.StartSlotId);
            var endSlot = await _context.Slots.FindAsync(reportDto.EndSlotId);
            if (startSlot == null || endSlot == null)
                throw new ArgumentException("Invalid Slot ID.");

            var report = MapToEntity(reportDto);
            await _reportRepository.UpdateReportAsync(report);
        }

        public async Task UpdateReportStatusAsync(int id, byte? status)
        {
            var existingReport = await _reportRepository.GetReportByIdAsync(id);
            if (existingReport == null) throw new KeyNotFoundException($"Report with ID {id} not found.");

            existingReport.Status = status ?? existingReport.Status;
            await _reportRepository.UpdateReportAsync(existingReport);
        }

        public async Task DeleteReportAsync(int id)
        {
            await _reportRepository.DeleteReportAsync(id);
        }

        private ReportDTO MapToDto(Report report)
        {
            if (report == null) return null;

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
                UserName = report.User?.FullName,
                StartSlotId = report.StartSlotId,
                EndSlotId = report.EndSlotId,
                StartSlot = report.StartSlot != null ? new SlotDTO(report.StartSlot) : null,
                EndSlot = report.EndSlot != null ? new SlotDTO(report.EndSlot) : null
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
                RoomId = reportDto.RoomId,
                StartSlotId = reportDto.StartSlotId,
                EndSlotId = reportDto.EndSlotId
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