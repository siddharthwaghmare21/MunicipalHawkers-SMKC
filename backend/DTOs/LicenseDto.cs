using System;
using System.ComponentModel.DataAnnotations;

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
        public string Status { get; set; } = "DRAFT";
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
        
        public string? RejectionReason { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
    }

    public class CreateLicenseDto
    {
        [Required(ErrorMessage = "Hawker ID is required.")]
        public int HawkerId { get; set; }

        [Required(ErrorMessage = "License Number is required.")]
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Issue Date is required.")]
        public DateTime IssueDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(20)]
        public string Status { get; set; } = "DRAFT";

        [Required(ErrorMessage = "License Type is required.")]
        [StringLength(50)]
        public string? LicenseType { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }
    }

    public class UpdateLicenseDto
    {
        [Required(ErrorMessage = "License Number is required.")]
        [StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Issue Date is required.")]
        public DateTime IssueDate { get; set; }

        [Required(ErrorMessage = "Expiry Date is required.")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(20)]
        public string Status { get; set; } = "DRAFT";

        [Required(ErrorMessage = "License Type is required.")]
        [StringLength(50)]
        public string? LicenseType { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }
    }
}
