using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS: Chỉ định rõ frontend domain và cho phép credentials (cookie/session)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React app domain
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Cho phép gửi cookie/session
    });
});
builder.Services.AddDistributedMemoryCache();
// Session configuration
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB context
builder.Services.AddDbContext<LibraryRoomBookingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));

// DI Repositories
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

// DI Services
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Order matters: UseCors before UseSession and UseAuthorization
app.UseCors("FrontendPolicy");

app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.Run();
