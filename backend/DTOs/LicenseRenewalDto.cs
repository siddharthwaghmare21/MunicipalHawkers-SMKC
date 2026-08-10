using System;

namespace backend.DTOs
{
    public class LicenseRenewalDto
    {
        public int Id { get; set; }
        public int LicenseId { get; set; }
        public DateTime RenewalDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? Remarks { get; set; }
    }

    public class CreateLicenseRenewalDto
    {
        public int LicenseId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
    }
}
