using ServerSide.Services;

namespace ServerSide.Jobs
{
    public class ReminderJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ReminderJob(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IBookingService>();

                await service.CheckAndSendRemindersAsync();

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }

}
