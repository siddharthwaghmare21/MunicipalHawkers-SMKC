using backend.DTOs;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IAuditLogService
    {
        Task LogActionAsync(int? userId, string action, string entityName, string entityId, string details);
        Task<PaginatedResult<AuditLogDto>> GetLogsAsync(int page, int pageSize);
    }
}
