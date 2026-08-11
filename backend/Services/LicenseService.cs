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
        private readonly IAuditLogService _auditLogService;

        public LicenseService(ApplicationDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
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

        public async Task<LicenseDto> CreateLicenseAsync(CreateLicenseDto dto, int? userId)
        {
            if (dto.IssueDate > dto.ExpiryDate)
                throw new System.InvalidOperationException("Issue Date cannot be after Expiry Date.");

            if (!string.IsNullOrWhiteSpace(dto.LicenseNumber))
            {
                var existing = await _context.Licenses.FirstOrDefaultAsync(l => l.LicenseNumber == dto.LicenseNumber);
                if (existing != null)
                    throw new System.InvalidOperationException($"A license with License Number '{dto.LicenseNumber}' already exists.");
            }
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
            
            await _auditLogService.LogActionAsync(userId, "Add License", "License", license.Id.ToString(), $"License '{license.LicenseNumber}' created for Hawker {dto.HawkerId}.");

            // Re-fetch to include Hawker for DTO mapping
            var createdLicense = await _context.Licenses.Include(l => l.Hawker).FirstAsync(l => l.Id == license.Id);
            return MapToDto(createdLicense);
        }

        public async Task<LicenseDto?> UpdateLicenseAsync(int id, UpdateLicenseDto dto, int? userId)
        {
            if (dto.IssueDate > dto.ExpiryDate)
                throw new System.InvalidOperationException("Issue Date cannot be after Expiry Date.");

            if (!string.IsNullOrWhiteSpace(dto.LicenseNumber))
            {
                var existing = await _context.Licenses.FirstOrDefaultAsync(l => l.LicenseNumber == dto.LicenseNumber && l.Id != id);
                if (existing != null)
                    throw new System.InvalidOperationException($"A license with License Number '{dto.LicenseNumber}' already exists.");
            }

            var license = await _context.Licenses.Include(l => l.Hawker).FirstOrDefaultAsync(l => l.Id == id);
            if (license == null) return null;

            license.LicenseNumber = dto.LicenseNumber;
            license.IssueDate = dto.IssueDate;
            license.ExpiryDate = dto.ExpiryDate;
            license.Status = dto.Status;
            license.LicenseType = dto.LicenseType;
            license.Remarks = dto.Remarks;

            await _context.SaveChangesAsync();

            await _auditLogService.LogActionAsync(userId, "Edit License", "License", license.Id.ToString(), $"License '{license.LicenseNumber}' updated.");

            return MapToDto(license);
        }

        public async Task<LicenseDto?> RejectLicenseAsync(int id, RejectDto dto, int? userId)
        {
            var license = await _context.Licenses.Include(l => l.Hawker).FirstOrDefaultAsync(l => l.Id == id);
            if (license == null) return null;

            if (license.Status == "REJECTED")
                throw new System.InvalidOperationException("License is already rejected.");

            license.Status = "REJECTED";
            license.RejectionReason = dto.RejectionReason;
            license.Remarks = dto.Remarks;
            license.RejectedById = userId;
            license.RejectedDate = System.DateTime.UtcNow;

            await _auditLogService.LogActionAsync(userId, "Reject License", "License", license.Id.ToString(), $"License {id} rejected. Reason: {dto.RejectionReason}");

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
