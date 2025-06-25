using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs.News;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class NewsRepository : INewsRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public NewsRepository(LibraryRoomBookingContext context)
        {
            _context = context;
        }

        public async Task<List<NewsDTO>> GetAllAsync()
        {
            return await _context.News
                .Include(n => n.CreatedByNavigation)
                .Select(n => new NewsDTO
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    CreatedDate = n.CreatedDate,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByNavigation.FullName
                })
                .ToListAsync();
        }

        public async Task<NewsDTO?> GetByIdAsync(int id)
        {
            return await _context.News
                .Where(n => n.Id == id)
                .Include(n => n.CreatedByNavigation)
                .Select(n => new NewsDTO
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    CreatedDate = n.CreatedDate,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByNavigation.FullName
                }).FirstOrDefaultAsync();
        }

        public async Task<List<NewsDTO>> FilterAsync(NewsFilterDTO filter)
        {
            var query = _context.News.Include(n => n.CreatedByNavigation).AsQueryable();

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(n =>
                    n.Title.Contains(filter.Keyword) ||
                    n.Description.Contains(filter.Keyword));
            }

            if (filter.FromDate.HasValue)
                query = query.Where(n => n.CreatedDate >= filter.FromDate);

            if (filter.ToDate.HasValue)
                query = query.Where(n => n.CreatedDate <= filter.ToDate);

            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                if (filter.SortBy.ToLower() == "title")
                    query = filter.IsAsc ? query.OrderBy(n => n.Title) : query.OrderByDescending(n => n.Title);
                else
                    query = filter.IsAsc ? query.OrderBy(n => n.CreatedDate) : query.OrderByDescending(n => n.CreatedDate);
            }

            return await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(n => new NewsDTO
                {
                    Id = n.Id,
                    Title = n.Title,
                    Description = n.Description,
                    CreatedDate = n.CreatedDate,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = n.CreatedByNavigation.FullName
                }).ToListAsync();
        }

        public async Task<int> CountAsync(NewsFilterDTO filter)
        {
            var query = _context.News.AsQueryable();

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                query = query.Where(n =>
                    n.Title.Contains(filter.Keyword) ||
                    n.Description.Contains(filter.Keyword));
            }

            if (filter.FromDate.HasValue)
                query = query.Where(n => n.CreatedDate >= filter.FromDate);

            if (filter.ToDate.HasValue)
                query = query.Where(n => n.CreatedDate <= filter.ToDate);

            return await query.CountAsync();
        }

        public async Task<News> CreateAsync(News news)
        {
            _context.News.Add(news);
            await _context.SaveChangesAsync();
            return news;
        }

        public async Task<bool> UpdateAsync(News news)
        {
            var existing = await _context.News.FindAsync(news.Id);
            if (existing == null) return false;

            existing.Title = news.Title;
            existing.Description = news.Description;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return false;

            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
