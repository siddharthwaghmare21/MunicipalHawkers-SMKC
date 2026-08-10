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
            var activeLicenses = await _context.Licenses.CountAsync(l => l.Status == "Active");
            var expiredLicenses = await _context.Licenses.CountAsync(l => l.Status == "Expired");
            var pendingRenewals = await _context.LicenseRenewals.CountAsync(r => r.Status == "Pending");

            return new DashboardDto
            {
                TotalHawkers = totalHawkers,
                ActiveLicenses = activeLicenses,
                ExpiredLicenses = expiredLicenses,
                PendingRenewals = pendingRenewals
            };
        }
    }
}
