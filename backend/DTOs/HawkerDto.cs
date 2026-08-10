using System;

namespace backend.DTOs
{
    public class HawkerDto
    {
        public int Id { get; set; }
        public string? EnrollmentNo { get; set; }
        public string FullName { get; set; } = string.Empty;
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

        public string Status { get; set; } = "Active";
        public string? RejectionReason { get; set; }
        public string? Remarks { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
    }

    public class CreateHawkerDto
    {
        public string? EnrollmentNo { get; set; }
        public string FullName { get; set; } = string.Empty;
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
    }

    public class UpdateHawkerDto : CreateHawkerDto
    {
    }
}
