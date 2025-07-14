using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB
builder.Services.AddDbContext<LibraryRoomBookingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));

// DI repo
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IRuleRepository, RuleRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();


// DI service
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRuleService, RuleService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IStudentService, StudentService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Sử dụng đúng CORS policy:
app.UseCors("FrontendPolicy");

// Session
app.UseSession();

// Nếu có auth:
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
