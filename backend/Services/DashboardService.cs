using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardStatsAsync()
        {
            var totalHawkers = await _context.Hawkers.CountAsync();
            var activeLicenses = await _context.Licenses.CountAsync(l => l.Status == "APPROVED");
            var expiredLicenses = await _context.Licenses.CountAsync(l => l.Status == "Expired");
            var pendingLicenses = await _context.Licenses.CountAsync(l => l.Status == "UNDER_REVIEW");
            var rejectedHawkers = await _context.Hawkers.CountAsync(h => h.Status == "REJECTED");
            var renewedLicenses = await _context.LicenseRenewals.CountAsync(r => r.Status == "APPROVED");
            var pendingRenewals = await _context.LicenseRenewals.CountAsync(r => r.Status == "UNDER_REVIEW");

            var recentlyAddedHawkers = await _context.Hawkers
                .OrderByDescending(h => h.Id)
                .Take(5)
                .Select(h => new HawkerSummaryDto
                {
                    Id = h.Id,
                    LicenseNumber = h.LicenseNumber,
                    FullName = h.FullName,
                    Status = h.Status,
                    MobileNumber = h.MobileNumber
                })
                .ToListAsync();

            var recentlyRenewedHawkers = await _context.LicenseRenewals
                .Include(r => r.License)
                .ThenInclude(l => l.Hawker)
                .Where(r => r.Status == "APPROVED")
                .OrderByDescending(r => r.RenewalDate)
                .Take(5)
                .Select(r => new LicenseRenewalSummaryDto
                {
                    Id = r.Id,
                    LicenseId = r.LicenseId,
                    LicenseNumber = r.License.LicenseNumber,
                    HawkerName = r.License.Hawker.FullName,
                    RenewalDate = r.RenewalDate,
                    ExpiryDate = r.ExpiryDate,
                    Status = r.Status
                })
                .ToListAsync();

            return new DashboardDto
            {
                TotalHawkers = totalHawkers,
                ActiveLicenses = activeLicenses,
                PendingLicenses = pendingLicenses,
                RejectedHawkers = rejectedHawkers,
                ExpiredLicenses = expiredLicenses,
                RenewedLicenses = renewedLicenses,
                PendingRenewals = pendingRenewals,
                RecentlyAddedHawkers = recentlyAddedHawkers,
                RecentlyRenewedHawkers = recentlyRenewedHawkers
            };
        }
    }
}
