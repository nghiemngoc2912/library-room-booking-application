﻿namespace ServerSide.DTOs.News
{
    public class UpdateNewsDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
    }
}
