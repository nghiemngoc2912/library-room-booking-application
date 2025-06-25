using ServerSide.DTOs.News;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class NewsService : INewsService
    {
        private readonly INewsRepository _repo;

        public NewsService(INewsRepository repo)
        {
            _repo = repo;
        }

        public Task<List<NewsDTO>> GetAllAsync() => _repo.GetAllAsync();
        public Task<NewsDTO?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);
        public Task<List<NewsDTO>> FilterAsync(NewsFilterDTO filter) => _repo.FilterAsync(filter);
        public Task<int> CountAsync(NewsFilterDTO filter) => _repo.CountAsync(filter);

        public Task<News> CreateAsync(CreateNewsDTO dto)
        {
            var news = new News
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };
            return _repo.CreateAsync(news);
        }

        public Task<bool> UpdateAsync(UpdateNewsDTO dto)
        {
            var news = new News
            {
                Id = dto.Id,
                Title = dto.Title,
                Description = dto.Description
            };
            return _repo.UpdateAsync(news);
        }

        public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
    }
}
