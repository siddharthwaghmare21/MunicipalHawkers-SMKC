using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;

        public AuditLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogActionAsync(int? userId, string action, string entityName, string entityId, string details)
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Details = details,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<PaginatedResult<AuditLogDto>> GetLogsAsync(int page, int pageSize)
        {
            var query = _context.AuditLogs.Include(a => a.User).AsQueryable();

            var totalCount = await query.CountAsync();
            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityName = a.EntityName,
                    EntityId = a.EntityId,
                    Timestamp = a.Timestamp,
                    UserId = a.UserId,
                    Username = a.User != null ? a.User.Username : null,
                    Details = a.Details
                })
                .ToListAsync();

            return new PaginatedResult<AuditLogDto>
            {
                Items = logs,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
