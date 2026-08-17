using System;
using System.Collections.Generic;

namespace backend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        
        public int RoleId { get; set; }
        public Role? Role { get; set; }
    }

    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class Hawker
    {
        public int Id { get; set; }
        public string? EnrollmentNo { get; set; }
        public string? AadharNo { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? FatherHusbandName { get; set; }
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
        public int? RejectedById { get; set; }
        public User? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }

        public ICollection<License> Licenses { get; set; } = new List<License>();
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class License
    {
        public int Id { get; set; }
        public int HawkerId { get; set; }
        public Hawker? Hawker { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "DRAFT";
        public string? LicenseType { get; set; }
        public string? Remarks { get; set; }
        
        public string? RejectionReason { get; set; }
        public int? RejectedById { get; set; }
        public User? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }

        public ICollection<LicenseRenewal> LicenseRenewals { get; set; } = new List<LicenseRenewal>();
    }

    public class LicenseRenewal
    {
        public int Id { get; set; }
        public int LicenseId { get; set; }
        public License? License { get; set; }
        public DateTime RenewalDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "UNDER_REVIEW";
        public int? UserId { get; set; }
        public User? User { get; set; }
        public string? Remarks { get; set; }
    }

    public class DocumentType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class Document
    {
        public int Id { get; set; }
        public int HawkerId { get; set; }
        public Hawker? Hawker { get; set; }
        public int DocumentTypeId { get; set; }
        public DocumentType? DocumentType { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string Status { get; set; } = "UNDER_REVIEW";
        public string? Remarks { get; set; }
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    }

    public class AuditLog
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int? UserId { get; set; }
        public User? User { get; set; }
        public string? Details { get; set; }
    }
}
