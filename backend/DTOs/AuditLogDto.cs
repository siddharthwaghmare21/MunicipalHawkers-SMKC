using System;

namespace backend.DTOs
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public DateTime Timestamp { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Details { get; set; }
    }
}
