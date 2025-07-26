using Hangfire;
using Microsoft.EntityFrameworkCore;
using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.Jobs;
using ServerSide.Middlewares;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Services;
using ServerSide.Validations;

var builder = WebApplication.CreateBuilder(args);

// ==================== CORS ====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // ← React client
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ==================== SESSION ====================
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

// ==================== CONTROLLERS & SWAGGER ====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==================== DB CONTEXT ====================
builder.Services.AddDbContext<LibraryRoomBookingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));

// ==================== CONFIGURATION BINDINGS ====================
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Read bookingrules.json
var bookingRulesConfig = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Config/bookingrules.json", optional: false, reloadOnChange: true)
    .Build();
builder.Services.Configure<BookingRules>(bookingRulesConfig);

// Read otprules.json
var otpRulesConfig = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Config/otprules.json", optional: false, reloadOnChange: true)
    .Build();
builder.Services.Configure<OtpRuleOptions>(otpRulesConfig);

// DB context
builder.Services.AddDbContext<LibraryRoomBookingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));
//Hangfire
builder.Services.AddHangfire(x =>
    x.UseSqlServerStorage(builder.Configuration.GetConnectionString("MyCnn")));
builder.Services.AddHangfireServer();


// DI Repositories
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();
builder.Services.AddScoped<INewsRepository, NewsRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();


builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IRuleRepository, RuleRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// ==================== SERVICES ====================
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IRuleService, RuleService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccountService, AccountService>();

// ==================== VALIDATIONS ====================
builder.Services.AddScoped<CreateBookingValidation>();

// ==================== BACKGROUND JOBS ====================
builder.Services.AddHostedService<BookingCleanupJob>();

//DI Job
builder.Services.AddScoped<ReputationJob>();

var bookingRulesConfig = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Config/bookingrules.json", optional: false, reloadOnChange: true)
    .Build();

var reputationConfig = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("Config/reputation-config.json", optional: false, reloadOnChange: true)
    .Build();

builder.Services.Configure<BookingRules>(bookingRulesConfig);
builder.Services.Configure<ReputationConfig>(reputationConfig);

var app = builder.Build();

// ==================== MIDDLEWARE ====================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var recurringJobs = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
    recurringJobs.AddOrUpdate<ReputationJob>(
        "update-reputation",
        job => job.UpdateReputation(),
        "0 0 * * 1" // Cron: 00:00 Monday "* * * * *" - 1 minute for each scheduled job
    );
}
app.UseHttpsRedirection();
app.UseRouting();

// Order matters: UseCors before UseSession and UseAuthorization
app.UseCors("FrontendPolicy");
app.UseSession();
app.UseAuthentication(); // nếu dùng JWT thì cần middleware xử lý trước
app.UseAuthorization();

app.MapControllers();

app.UseMiddleware<ExceptionMiddleware>();

app.Run();
