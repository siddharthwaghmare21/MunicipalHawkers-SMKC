using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class LicenseService : ILicenseService
    {
        private readonly ApplicationDbContext _context;

        public LicenseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResult<LicenseDto>> GetAllLicensesAsync(string? searchQuery = null, string? statusFilter = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Licenses.Include(l => l.Hawker).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var lowerQuery = searchQuery.ToLower();
                query = query.Where(l => 
                    (l.LicenseNumber != null && l.LicenseNumber.ToLower().Contains(lowerQuery)) || 
                    (l.Hawker != null && l.Hawker.FullName != null && l.Hawker.FullName.ToLower().Contains(lowerQuery)));
            }

            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                var lowerStatus = statusFilter.ToLower();
                query = query.Where(l => l.Status.ToLower() == lowerStatus);
            }

            var totalCount = await query.CountAsync();
            
            var items = await query
                .OrderByDescending(l => l.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<LicenseDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<LicenseDto?> GetLicenseByIdAsync(int id)
        {
            var license = await _context.Licenses.Include(l => l.Hawker).FirstOrDefaultAsync(l => l.Id == id);
            if (license == null) return null;
            return MapToDto(license);
        }

        public async Task<LicenseDto> CreateLicenseAsync(CreateLicenseDto dto)
        {
            var license = new License
            {
                HawkerId = dto.HawkerId,
                LicenseNumber = dto.LicenseNumber,
                IssueDate = dto.IssueDate,
                ExpiryDate = dto.ExpiryDate,
                Status = dto.Status,
                LicenseType = dto.LicenseType,
                Remarks = dto.Remarks
            };

            _context.Licenses.Add(license);
            await _context.SaveChangesAsync();
            
            // Re-fetch to include Hawker for DTO mapping
            var createdLicense = await _context.Licenses.Include(l => l.Hawker).FirstAsync(l => l.Id == license.Id);
            return MapToDto(createdLicense);
        }

        public async Task<LicenseDto?> UpdateLicenseAsync(int id, UpdateLicenseDto dto)
        {
            var license = await _context.Licenses.Include(l => l.Hawker).FirstOrDefaultAsync(l => l.Id == id);
            if (license == null) return null;

            license.LicenseNumber = dto.LicenseNumber;
            license.IssueDate = dto.IssueDate;
            license.ExpiryDate = dto.ExpiryDate;
            license.Status = dto.Status;
            license.LicenseType = dto.LicenseType;
            license.Remarks = dto.Remarks;

            await _context.SaveChangesAsync();
            return MapToDto(license);
        }

        public async Task<LicenseDto?> RejectLicenseAsync(int id, RejectDto dto, int? userId)
        {
            var license = await _context.Licenses.Include(l => l.Hawker).FirstOrDefaultAsync(l => l.Id == id);
            if (license == null) return null;

            if (license.Status == "Rejected")
                throw new System.InvalidOperationException("License is already rejected.");

            license.Status = "Rejected";
            license.RejectionReason = dto.RejectionReason;
            license.Remarks = dto.Remarks;
            license.RejectedById = userId;
            license.RejectedDate = System.DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Reject License",
                UserId = userId,
                Details = $"License {id} rejected. Reason: {dto.RejectionReason}"
            });

            await _context.SaveChangesAsync();
            return MapToDto(license);
        }

        private static LicenseDto MapToDto(License license)
        {
            return new LicenseDto
            {
                Id = license.Id,
                HawkerId = license.HawkerId,
                HawkerName = license.Hawker?.FullName,
                LicenseNumber = license.LicenseNumber,
                IssueDate = license.IssueDate,
                ExpiryDate = license.ExpiryDate,
                Status = license.Status,
                LicenseType = license.LicenseType,
                Remarks = license.Remarks,
                RejectionReason = license.RejectionReason,
                RejectedBy = license.RejectedBy?.Username,
                RejectedDate = license.RejectedDate
            };
        }
    }
}
