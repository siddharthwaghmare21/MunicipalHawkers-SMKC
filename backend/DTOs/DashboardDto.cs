using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class DashboardDto
    {
        public int TotalHawkers { get; set; }
        public int ActiveLicenses { get; set; }
        public int PendingLicenses { get; set; }
        public int RejectedHawkers { get; set; }
        public int ExpiredLicenses { get; set; }
        public int RenewedLicenses { get; set; }
        public int PendingRenewals { get; set; }
        
        public List<HawkerSummaryDto> RecentlyAddedHawkers { get; set; } = new List<HawkerSummaryDto>();
        public List<LicenseRenewalSummaryDto> RecentlyRenewedHawkers { get; set; } = new List<LicenseRenewalSummaryDto>();
    }

    public class HawkerSummaryDto
    {
        public int Id { get; set; }
        public string? EnrollmentNo { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? MobileNumber { get; set; }
    }

    public class LicenseRenewalSummaryDto
    {
        public int Id { get; set; }
        public int LicenseId { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public string HawkerName { get; set; } = string.Empty;
        public DateTime RenewalDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
