using ServerSide.Models;

namespace ServerSide.Repositories
{
    public interface INewsRepository
    {
        Task<List<News>> GetAllAsync();
        Task<News?> GetByIdAsync(int id);
        Task<List<News>> FilterAsync(DateTime? fromDate, DateTime? toDate, string? keyword, string? sortBy, bool isAsc, int pageIndex, int pageSize);
        Task<int> CountAsync(DateTime? fromDate, DateTime? toDate, string? keyword);
        Task<News> CreateAsync(News news);
        Task<bool> UpdateAsync(News news);
        Task<bool> DeleteAsync(int id);
    }
}