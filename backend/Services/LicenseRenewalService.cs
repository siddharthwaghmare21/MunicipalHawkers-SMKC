using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class LicenseRenewalService : ILicenseRenewalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILicenseService _licenseService;

        public LicenseRenewalService(ApplicationDbContext context, ILicenseService licenseService)
        {
            _context = context;
            _licenseService = licenseService;
        }

        public async Task<IEnumerable<LicenseRenewalDto>> GetRenewalsForLicenseAsync(int licenseId)
        {
            var renewals = await _context.LicenseRenewals
                .Include(r => r.User)
                .Where(r => r.LicenseId == licenseId)
                .OrderByDescending(r => r.RenewalDate)
                .ToListAsync();

            return renewals.Select(r => new LicenseRenewalDto
            {
                Id = r.Id,
                LicenseId = r.LicenseId,
                RenewalDate = r.RenewalDate,
                ExpiryDate = r.ExpiryDate,
                Status = r.Status,
                UserId = r.UserId,
                Username = r.User?.Username,
                Remarks = r.Remarks
            });
        }

        public async Task<LicenseDto?> ProcessRenewalAsync(CreateLicenseRenewalDto dto, int? userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var license = await _context.Licenses.FindAsync(dto.LicenseId);
                if (license == null) return null;

                if (license.Status == "REJECTED")
                    throw new System.InvalidOperationException("Cannot renew a rejected license.");
                
                var expectedExpiryDate = license.ExpiryDate.AddYears(5);
                if (dto.ExpiryDate.Date != expectedExpiryDate.Date)
                {
                    throw new System.InvalidOperationException($"Renewal expiry date must be exactly 5 years from current expiry date ({expectedExpiryDate:dd/MM/yyyy}).");
                }

                // 1. Preserve history by creating a LicenseRenewal record reflecting the PREVIOUS state.
                // Or wait, the requirement is "Create LicenseRenewal record, Update current license".
                // Usually, the renewal record logs the transaction that just occurred, meaning the NEW expiry and status.
                // Let's store the new expiry and status in the renewal, representing the renewal action.
                var renewal = new LicenseRenewal
                {
                    LicenseId = license.Id,
                    RenewalDate = DateTime.UtcNow,
                    ExpiryDate = dto.ExpiryDate,
                    Status = dto.Status,
                    UserId = userId,
                    Remarks = dto.Remarks
                };

                _context.LicenseRenewals.Add(renewal);

                // 2. Update current license
                license.ExpiryDate = dto.ExpiryDate;
                license.Status = dto.Status;
                if (!string.IsNullOrWhiteSpace(dto.LicenseType))
                {
                    license.LicenseType = dto.LicenseType;
                }
                license.Remarks = dto.Remarks;

                // Sync hawker status if active/approved
                var hawker = await _context.Hawkers.FindAsync(license.HawkerId);
                if (hawker != null && hawker.Status != "REJECTED")
                {
                    if (dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("APPROVED", StringComparison.OrdinalIgnoreCase))
                    {
                        hawker.Status = "APPROVED";
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await _licenseService.GetLicenseByIdAsync(license.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
