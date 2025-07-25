
using Microsoft.Extensions.Options;
using ServerSide.Constants;
using ServerSide.Services;

namespace ServerSide.Jobs
{
    public class BookingCleanupJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly BookingRules _rules;
        public BookingCleanupJob(IServiceScopeFactory scopeFactory,IOptions<BookingRules> options)
        {
            _scopeFactory = scopeFactory;
            _rules = options.Value;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now.TimeOfDay;

                if (now >= TimeSpan.FromHours(_rules.TimeStart) && now <= TimeSpan.FromHours(_rules.TimeEnd))
                {
                    using var scope = _scopeFactory.CreateScope();
                    var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
                    await bookingService.CancelExpiredBookingsAsync();
                }

                await Task.Delay(TimeSpan.FromMinutes(_rules.TimeJobInterval), stoppingToken);
            }
        }
    }
}
