using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using System;

namespace ServerSide.Repositories
{
    public class OtpRepository : IOtpRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public OtpRepository(LibraryRoomBookingContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<OtpCode?> GetValidOtpAsync(string code, int otpType)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            return await _context.OtpCodes.FirstOrDefaultAsync(o =>
                o.Code == code &&
                o.OtpType == otpType &&
                !o.IsUsed &&
                o.ExpiredAt > nowVN);
        }

        public async Task<OtpCode?> GetActiveOtpByUsernameAsync(string username, int otpType)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

            return await _context.OtpCodes
                .Where(o => o.Username == username &&
                            o.OtpType == otpType &&
                            !o.IsUsed &&
                            o.ExpiredAt > nowVN)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task CreateOtpAsync(OtpCode otp)
        {
            await _context.OtpCodes.AddAsync(otp);
            await _context.SaveChangesAsync();
        }

        public async Task MarkOtpAsUsedAsync(OtpCode otp)
        {
            otp.IsUsed = true;
            _context.OtpCodes.Update(otp);
            await _context.SaveChangesAsync();
        }
    }

    public interface IOtpRepository
    {
        Task<OtpCode?> GetValidOtpAsync(string code, int otpType);
        Task<OtpCode?> GetActiveOtpByUsernameAsync(string username, int otpType);
        Task CreateOtpAsync(OtpCode otp);
        Task MarkOtpAsUsedAsync(OtpCode otp);
    }
}