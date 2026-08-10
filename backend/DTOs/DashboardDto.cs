namespace backend.DTOs
{
    public class DashboardDto
    {
        public int TotalHawkers { get; set; }
        public int ActiveLicenses { get; set; }
        public int ExpiredLicenses { get; set; }
        public int PendingRenewals { get; set; }
    }
}
