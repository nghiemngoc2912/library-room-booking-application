using Microsoft.EntityFrameworkCore;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<LibraryRoomBookingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));
//DI repo
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<ISlotRepository, SlotRepository>();
//DI service
builder.Services.AddScoped<IBookingService,BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ISlotService, SlotService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
