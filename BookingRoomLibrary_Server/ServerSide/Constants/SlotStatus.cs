using System.ComponentModel;

public enum SlotStatus : byte
{
    [Description("Đang chờ duyệt")]
    Pending = 0,

    [Description("Hoạt động")]
    Active = 1,

    [Description("Ngưng hoạt động")]
    Inactive = 3
}
