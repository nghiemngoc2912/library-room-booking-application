using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public async Task<List<News>> GetAllAsync()
        {
            var list = await _context.News
                .Include(n => n.CreatedByNavigation)
                .ToListAsync();

            return list;
        }

        public async Task<News?> GetByIdAsync(int id)
        {
            return await _context.News
                .Include(n => n.CreatedByNavigation)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<List<News>> FilterAsync(DateTime? fromDate, DateTime? toDate, string? keyword, string? sortBy, bool isAsc, int pageIndex, int pageSize)
        {
            var query = _context.News.Include(n => n.CreatedByNavigation).AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(n => n.Title.Contains(keyword) || n.Description.Contains(keyword));
            }

            if (fromDate.HasValue)
                query = query.Where(n => n.CreatedDate >= fromDate);

            if (toDate.HasValue)
                query = query.Where(n => n.CreatedDate <= toDate);

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "title":
                        query = isAsc ? query.OrderBy(n => n.Title) : query.OrderByDescending(n => n.Title);
                        break;
                    case "createddate":
                        query = isAsc
                            ? query.OrderBy(n => n.CreatedDate ?? DateTime.MinValue)
                            : query.OrderByDescending(n => n.CreatedDate ?? DateTime.MinValue);
                        break;
                    default:
                        query = query.OrderByDescending(n => n.CreatedDate); // fallback tránh crash
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(n => n.CreatedDate); // default nếu sortBy null
            }

            return await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> CountAsync(DateTime? fromDate, DateTime? toDate, string? keyword)
        {
            var query = _context.News.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(n => n.Title.Contains(keyword) || n.Description.Contains(keyword));

            if (fromDate.HasValue)
                query = query.Where(n => n.CreatedDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(n => n.CreatedDate <= toDate.Value);


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
