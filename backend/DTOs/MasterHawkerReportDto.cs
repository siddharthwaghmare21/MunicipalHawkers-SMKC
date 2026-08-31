using System;

namespace backend.DTOs
{
    public class MasterHawkerReportDto
    {
        public int HawkerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string? MobileNumber { get; set; }
        public string HandicapStatus { get; set; } = "No";
        public string? ULBName { get; set; }
        public string? WardName { get; set; }
        public string? RoadName { get; set; }
        public string? LandMark { get; set; }
        public string? AreaType { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessTime { get; set; }
        public string? LocationType { get; set; }
        public string? PartnerDependancy { get; set; }
        public string HawkerStatus { get; set; } = string.Empty;

        // License Information
        public string? LicenseNumber { get; set; }
        public DateTime? LicenseIssueDate { get; set; }
        public DateTime? LicenseExpiryDate { get; set; }
        public string? LicenseStatus { get; set; }
    }
}
