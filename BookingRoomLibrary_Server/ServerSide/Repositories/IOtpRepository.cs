using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class OtpRepository : IOtpRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public OtpRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task<OtpCode?> GetValidOtpAsync(string code, int otpType)
        {
            return await _context.OtpCodes.FirstOrDefaultAsync(o =>
                o.Code == code && o.OtpType == otpType && !o.IsUsed && o.ExpiredAt > DateTime.UtcNow);
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

        public async Task<OtpCode?> GetActiveOtpByUsernameAsync(string username, int otpType)
        {
            return await _context.OtpCodes
                .Where(o => o.Username == username
                            && o.OtpType == otpType
                            && !o.IsUsed
                            && o.ExpiredAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();
        }

    }

    public interface IOtpRepository
    {
        Task<OtpCode?> GetValidOtpAsync(string code, int otpType);
        Task CreateOtpAsync(OtpCode otp);
        Task MarkOtpAsUsedAsync(OtpCode otp);
        Task<OtpCode?> GetActiveOtpByUsernameAsync(string username, int otpType);
    }
}
