using ServerSide.DTOs.News;

namespace ServerSide.Services
{
    public interface INewsService
    {
        Task<List<NewsDTO>> GetAllAsync();
        Task<NewsDTO?> GetByIdAsync(int id);
        Task<List<NewsDTO>> FilterAsync(NewsFilterDTO filter);
        Task<int> CountAsync(NewsFilterDTO filter);
        Task<NewsDTO> CreateAsync(CreateNewsDTO dto);
        Task<bool> UpdateAsync(UpdateNewsDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
