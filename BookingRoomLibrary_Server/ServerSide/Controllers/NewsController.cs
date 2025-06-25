using Microsoft.AspNetCore.Mvc;
using ServerSide.DTOs.News;
using ServerSide.Services;

namespace ServerSide.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _service;

        public NewsController(INewsService service)
        {
            _service = service;
        }

        // GET: api/news/filter?keyword=abc&pageIndex=1&pageSize=5&fromDate=...&toDate=...
        [HttpGet("filter")]
        public async Task<IActionResult> FilterNews([FromQuery] NewsFilterDTO filter)
        {
            var result = await _service.FilterAsync(filter);
            var total = await _service.CountAsync(filter);

            return Ok(new
            {
                data = result,
                totalRecords = total,
                pageIndex = filter.PageIndex,
                pageSize = filter.PageSize
            });
        }

        // GET: api/news/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var news = await _service.GetByIdAsync(id);
            if (news == null) return NotFound();
            return Ok(news);
        }

        // POST: api/news
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNewsDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/news
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateNewsDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _service.UpdateAsync(dto);
            if (!success) return NotFound();

            return Ok(new { message = "Updated successfully" });
        }

        // DELETE: api/news/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();

            return Ok(new { message = "Deleted successfully" });
        }
    }
}
