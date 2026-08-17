using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class HawkerDto
    {
        public int Id { get; set; }
        public string? EnrollmentNo { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? FatherHusbandName { get; set; }
        public string? AadharNo { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string? MobileNumber { get; set; }
        public bool Handicap { get; set; }
        public string? ULBName { get; set; }
        public string? WardName { get; set; }
        public string? RoadName { get; set; }
        public string? LandMark { get; set; }
        public string? AreaType { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessTime { get; set; }
        public string? LocationType { get; set; }
        public string? PartnerDependancy { get; set; }

        public string Status { get; set; } = "DRAFT";
        public string? RejectionReason { get; set; }
        public string? Remarks { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
    }

    public class CreateHawkerDto
    {
        [Required(ErrorMessage = "Enrollment Number is required.")]
        [RegularExpression(@"^SMKC-.*", ErrorMessage = "Enrollment Number must start with 'SMKC-'.")]
        [StringLength(50)]
        public string? EnrollmentNo { get; set; }

        [Required(ErrorMessage = "Full Name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Full Name must be between 3 and 100 characters.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Father / Husband Name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Father / Husband Name must be between 3 and 100 characters.")]
        public string? FatherHusbandName { get; set; }

        [Required(ErrorMessage = "Aadhar Number is required.")]
        [RegularExpression(@"^\d{12}$", ErrorMessage = "Aadhar Number must be exactly 12 digits.")]
        public string? AadharNo { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(500)]
        public string? Address { get; set; }

        [Required(ErrorMessage = "Gender is required.")]
        public string? Gender { get; set; }

        [Required(ErrorMessage = "Date of Birth is required.")]
        public DateTime? DOB { get; set; }

        [Required(ErrorMessage = "Mobile Number is required.")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile Number must be exactly 10 digits.")]
        public string? MobileNumber { get; set; }

        public bool Handicap { get; set; }

        [Required(ErrorMessage = "ULB Name is required.")]
        [StringLength(100)]
        public string? ULBName { get; set; }

        [Required(ErrorMessage = "Ward Name is required.")]
        [StringLength(100)]
        public string? WardName { get; set; }

        [Required(ErrorMessage = "Road Name is required.")]
        [StringLength(100)]
        public string? RoadName { get; set; }

        [Required(ErrorMessage = "Land Mark is required.")]
        [StringLength(100)]
        public string? LandMark { get; set; }

        [Required(ErrorMessage = "Area Type is required.")]
        [StringLength(50)]
        public string? AreaType { get; set; }

        [Required(ErrorMessage = "Business Type is required.")]
        [StringLength(50)]
        public string? BusinessType { get; set; }

        [Required(ErrorMessage = "Business Time is required.")]
        [StringLength(50)]
        public string? BusinessTime { get; set; }

        [Required(ErrorMessage = "Location Type is required.")]
        [StringLength(50)]
        public string? LocationType { get; set; }

        [Required(ErrorMessage = "Partner Dependancy is required.")]
        [StringLength(50)]
        public string? PartnerDependancy { get; set; }

        public DateTime? LicenseExpiryDate { get; set; }
    }

    public class UpdateHawkerDto : CreateHawkerDto
    {
    }
}
