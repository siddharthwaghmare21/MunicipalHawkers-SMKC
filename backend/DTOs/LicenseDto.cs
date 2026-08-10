using System;

namespace backend.DTOs
{
    public class LicenseDto
    {
        public int Id { get; set; }
        public int HawkerId { get; set; }
        public string? HawkerName { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
        
        public string? RejectionReason { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
    }

    public class CreateLicenseDto
    {
        public int HawkerId { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
    }

    public class UpdateLicenseDto
    {
        public string LicenseNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
    }
}
