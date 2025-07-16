
using ServerSide.Services;

namespace ServerSide.Helpers
{
    public class BookingCleanupJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public BookingCleanupJob(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now.TimeOfDay;

                if (now >= TimeSpan.FromHours(9) && now <= TimeSpan.FromHours(18))
                {
                    using var scope = _scopeFactory.CreateScope();
                    var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
                    await bookingService.CancelExpiredBookingsAsync();
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
