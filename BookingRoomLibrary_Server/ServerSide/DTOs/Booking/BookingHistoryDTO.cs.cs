﻿using ServerSide.DTOs.Rating;

namespace ServerSide.DTOs.Booking
{
    public class BookingHistoryDTO
    {
        public int Id { get; set; }
        public string BookingDate { get; set; } = null!;
        public string RoomName { get; set; } = null!;
        public string Slot { get; set; } = null!;
        public RatingDTO? Rating { get; set; } 
    }
}