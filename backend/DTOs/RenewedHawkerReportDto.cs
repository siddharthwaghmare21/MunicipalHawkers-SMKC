using System;

namespace backend.DTOs
{
    public class RenewedHawkerReportDto
    {
        public int Id { get; set; } // Renewal ID
        public int HawkerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public DateTime RenewDate { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
