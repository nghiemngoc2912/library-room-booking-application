namespace ServerSide.Middlewares
{
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using ServerSide.Exceptions;

    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context); // gọi request tiếp theo
            }
            catch (AuthorizeException ex)
            {
                // Nếu lỗi là do bạn ném từ RoleFilter
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = ex.Message });
            }
            catch (Exception)
            {
                // Xử lý các lỗi khác
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { message = "Internal Server Error" });
            }
        }
    }

}
