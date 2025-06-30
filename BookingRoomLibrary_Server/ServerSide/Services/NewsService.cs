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

        public async Task<List<NewsDTO>> GetAllAsync()
        {
            var entities = await _repo.GetAllAsync();
            return entities.Select(MapToDTO).ToList();
        }

        public async Task<NewsDTO?> GetByIdAsync(int id)
        {
            var news = await _repo.GetByIdAsync(id);
            return news == null ? null : MapToDTO(news);
        }

        public async Task<List<NewsDTO>> FilterAsync(NewsFilterDTO filter)
        {
            var entities = await _repo.FilterAsync(
                filter.FromDate, filter.ToDate,
                filter.Keyword, filter.SortBy,
                filter.IsAsc, filter.PageIndex, filter.PageSize
            );
            return entities.Select(MapToDTO).ToList();
        }

        public Task<int> CountAsync(NewsFilterDTO filter)
        {
            return _repo.CountAsync(filter.FromDate, filter.ToDate, filter.Keyword);
        }

        public async Task<NewsDTO> CreateAsync(CreateNewsDTO dto)
        {
            var news = new News
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedBy = dto.CreatedBy,
                CreatedDate = DateTime.Now
            };

            var created = await _repo.CreateAsync(news);
            return MapToDTO(created);
        }

        public async Task<bool> UpdateAsync(UpdateNewsDTO dto)
        {
            var news = new News
            {
                Id = dto.Id,
                Title = dto.Title,
                Description = dto.Description
            };

            return await _repo.UpdateAsync(news);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return _repo.DeleteAsync(id);
        }

        private NewsDTO MapToDTO(News n)
        {
            return new NewsDTO
            {
                Id = n.Id,
                Title = n.Title,
                Description = n.Description,
                CreatedDate = n.CreatedDate,
                CreatedBy = n.CreatedBy,
                CreatedByName = n.CreatedByNavigation?.FullName ?? "(Unknown)"
            };
        }
    }
}
