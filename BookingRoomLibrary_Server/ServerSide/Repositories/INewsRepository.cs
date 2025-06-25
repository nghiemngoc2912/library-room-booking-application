using ServerSide.DTOs.News;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public interface INewsRepository
    {
        Task<List<NewsDTO>> GetAllAsync();
        Task<NewsDTO?> GetByIdAsync(int id);
        Task<List<NewsDTO>> FilterAsync(NewsFilterDTO filter);
        Task<int> CountAsync(NewsFilterDTO filter);
        Task<News> CreateAsync(News news);
        Task<bool> UpdateAsync(News news);
        Task<bool> DeleteAsync(int id);
    }
}
