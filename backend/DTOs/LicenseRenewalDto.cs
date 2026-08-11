using System;
using System.ComponentModel.DataAnnotations;

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
        [Required(ErrorMessage = "License ID is required.")]
        public int LicenseId { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty;

        [StringLength(50)]
        public string? LicenseType { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }
    }
}
