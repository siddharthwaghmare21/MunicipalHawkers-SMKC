using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "IT_ADMIN")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResult<AuditLogDto>>>> GetLogs(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var result = await _auditLogService.GetLogsAsync(page, pageSize);
            return Ok(new ApiResponse<PaginatedResult<AuditLogDto>>
            {
                Success = true,
                Message = "Audit logs retrieved successfully",
                Data = result
            });
        }
    }
}
