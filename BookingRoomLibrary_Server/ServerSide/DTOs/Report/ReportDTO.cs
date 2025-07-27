namespace ServerSide.DTOs.Report
{
    public class ReportDTO
    {
        public int Id { get; set; }
        public int RuleId { get; set; }
        public string? ReportType { get; set; }
        public string? Description { get; set; }
        public byte? Status { get; set; }
        public DateTime? CreateAt { get; set; }
        public int UserId { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public int? ResolvedBy { get; set; }
        public int RoomId { get; set; }
        public string? UserName { get; set; }
        public int StartSlotId { get; set; } // Thêm cột mới
        public int EndSlotId { get; set; }   // Thêm cột mới
        public SlotDTO? StartSlot { get; set; } // Thêm đối tượng Slot
        public SlotDTO? EndSlot { get; set; }   // Thêm đối tượng Slot
    }

    public class ReportUpdateDTO
    {
        public int Id { get; set; }
        public byte? Status { get; set; } // Cho phép null để giữ nguyên giá trị cũ nếu không thay đổi
    }
}