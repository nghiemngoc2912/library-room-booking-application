using System.ComponentModel;
namespace ServerSide.Constants
{
    public enum RoomStatus : byte
    {
        [Description("Đang chờ duyệt")]
        Pending = 0,

        [Description("Hoạt động")]
        Active = 1,

        [Description("Bảo trì")]
        Maintenance = 2,

        [Description("Ngưng hoạt động")]
        Inactive = 3
    }
}
