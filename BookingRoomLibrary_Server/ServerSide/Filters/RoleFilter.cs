using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServerSide.Exceptions;

namespace ServerSide.Filters
{
    public class RoleFilter : Attribute, IAuthorizationFilter
    {
        private readonly int[] _allowedRoles;

        public RoleFilter(params int[] allowedRoles)
        {
            _allowedRoles = allowedRoles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var session = context.HttpContext.Session;
            var role = session.GetInt32("Role");

            // Kiểm tra nếu chưa đăng nhập
            if (role == null)
            {
                context.Result = new UnauthorizedResult(); // 401 Unauthorized
                return;
            }

            // Kiểm tra nếu Role không nằm trong danh sách Role cho phép
            if (!_allowedRoles.Contains(role.Value))
            {
                context.Result = new ForbidResult(); // 403 Forbidden
                return;
            }
        }
    }
}