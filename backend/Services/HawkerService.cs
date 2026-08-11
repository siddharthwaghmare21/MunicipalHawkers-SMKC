using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class HawkerService : IHawkerService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public HawkerService(ApplicationDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        public async Task<PaginatedResult<HawkerDto>> GetAllHawkersAsync(string? searchQuery = null, string? zoneFilter = null, string? statusFilter = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Hawkers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var lowerQuery = searchQuery.ToLower();
                query = query.Where(h => 
                    (h.FullName != null && h.FullName.ToLower().Contains(lowerQuery)) || 
                    (h.EnrollmentNo != null && h.EnrollmentNo.ToLower().Contains(lowerQuery)));
            }

            if (!string.IsNullOrWhiteSpace(zoneFilter))
            {
                query = query.Where(h => h.WardName == zoneFilter);
            }

            if (!string.IsNullOrWhiteSpace(statusFilter) && statusFilter != "All")
            {
                var lowerStatus = statusFilter.ToLower();
                query = query.Where(h => h.Status.ToLower() == lowerStatus);
            }
            else if (statusFilter != "All")
            {
                // Default to showing only Active hawkers if status filter is not specified or not "All"
                query = query.Where(h => h.Status == "APPROVED");
            }

            var totalCount = await query.CountAsync();
            
            var items = await query
                .OrderByDescending(h => h.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<HawkerDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<HawkerDto?> GetHawkerByIdAsync(int id)
        {
            var hawker = await _context.Hawkers.FindAsync(id);
            if (hawker == null) return null;
            return MapToDto(hawker);
        }

        public async Task<HawkerDto> CreateHawkerAsync(CreateHawkerDto dto, int? userId)
        {
            if (dto.DOB.HasValue && dto.DOB.Value > System.DateTime.UtcNow)
                throw new System.InvalidOperationException("Date of Birth cannot be in the future.");

            if (!string.IsNullOrWhiteSpace(dto.EnrollmentNo))
            {
                var existing = await _context.Hawkers.FirstOrDefaultAsync(h => h.EnrollmentNo == dto.EnrollmentNo);
                if (existing != null)
                    throw new System.InvalidOperationException($"A hawker with Enrollment Number '{dto.EnrollmentNo}' already exists.");
            }
            var hawker = new Hawker
            {
                EnrollmentNo = dto.EnrollmentNo,
                FullName = dto.FullName,
                Address = dto.Address,
                Gender = dto.Gender,
                DOB = dto.DOB,
                MobileNumber = dto.MobileNumber,
                Handicap = dto.Handicap,
                ULBName = dto.ULBName,
                WardName = dto.WardName,
                RoadName = dto.RoadName,
                LandMark = dto.LandMark,
                AreaType = dto.AreaType,
                BusinessType = dto.BusinessType,
                BusinessTime = dto.BusinessTime,
                LocationType = dto.LocationType,
                PartnerDependancy = dto.PartnerDependancy
            };

            _context.Hawkers.Add(hawker);
            await _context.SaveChangesAsync();

            var monthYear = System.DateTime.UtcNow.ToString("MMMM-yyyy");
            var licenseNo = $"LIC-{hawker.EnrollmentNo}-{monthYear}";
            var defaultExpiry = new System.DateTime(System.DateTime.UtcNow.Year + 5, System.DateTime.UtcNow.Month, 1).AddMonths(1).AddDays(-1);

            var license = new License
            {
                HawkerId = hawker.Id,
                LicenseNumber = licenseNo,
                IssueDate = System.DateTime.UtcNow,
                ExpiryDate = dto.LicenseExpiryDate ?? defaultExpiry,
                LicenseType = "Standard",
                Status = "APPROVED"
            };

            _context.Licenses.Add(license);
            await _context.SaveChangesAsync();

            await _auditLogService.LogActionAsync(userId, "Add Hawker", "Hawker", hawker.Id.ToString(), $"Hawker '{hawker.FullName}' and default license added.");

            return MapToDto(hawker);
        }

        public async Task<HawkerDto?> UpdateHawkerAsync(int id, UpdateHawkerDto dto, int? userId)
        {
            if (dto.DOB.HasValue && dto.DOB.Value > System.DateTime.UtcNow)
                throw new System.InvalidOperationException("Date of Birth cannot be in the future.");

            if (!string.IsNullOrWhiteSpace(dto.EnrollmentNo))
            {
                var existing = await _context.Hawkers.FirstOrDefaultAsync(h => h.EnrollmentNo == dto.EnrollmentNo && h.Id != id);
                if (existing != null)
                    throw new System.InvalidOperationException($"A hawker with Enrollment Number '{dto.EnrollmentNo}' already exists.");
            }

            var hawker = await _context.Hawkers.FindAsync(id);
            if (hawker == null) return null;

            hawker.EnrollmentNo = dto.EnrollmentNo;
            hawker.FullName = dto.FullName;
            hawker.Address = dto.Address;
            hawker.Gender = dto.Gender;
            hawker.DOB = dto.DOB;
            hawker.MobileNumber = dto.MobileNumber;
            hawker.Handicap = dto.Handicap;
            hawker.ULBName = dto.ULBName;
            hawker.WardName = dto.WardName;
            hawker.RoadName = dto.RoadName;
            hawker.LandMark = dto.LandMark;
            hawker.AreaType = dto.AreaType;
            hawker.BusinessType = dto.BusinessType;
            hawker.BusinessTime = dto.BusinessTime;
            hawker.LocationType = dto.LocationType;
            hawker.PartnerDependancy = dto.PartnerDependancy;

            await _context.SaveChangesAsync();

            await _auditLogService.LogActionAsync(userId, "Edit Hawker", "Hawker", hawker.Id.ToString(), $"Hawker '{hawker.FullName}' updated.");

            return MapToDto(hawker);
        }

        public async Task<HawkerDto?> RejectHawkerAsync(int id, RejectDto dto, int? userId)
        {
            var hawker = await _context.Hawkers.FindAsync(id);
            if (hawker == null) return null;

            if (hawker.Status == "REJECTED")
                throw new System.InvalidOperationException("Hawker is already rejected.");

            hawker.Status = "REJECTED";
            hawker.RejectionReason = dto.RejectionReason;
            hawker.Remarks = dto.Remarks;
            hawker.RejectedById = userId;
            hawker.RejectedDate = System.DateTime.UtcNow;

            await _auditLogService.LogActionAsync(userId, "Reject Hawker", "Hawker", hawker.Id.ToString(), $"Hawker {hawker.Id} rejected. Reason: {dto.RejectionReason}");

            await _context.SaveChangesAsync();
            return MapToDto(hawker);
        }

        public async Task<PaginatedResult<MasterHawkerReportDto>> GetMasterReportAsync(string? searchQuery, int page, int pageSize)
        {
            var query = _context.Hawkers
                .Include(h => h.Licenses)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                query = query.Where(h => h.EnrollmentNo.Contains(searchQuery) || h.FullName.Contains(searchQuery));
            }

            var totalItems = await query.CountAsync();
            var hawkers = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = hawkers.Select(h =>
            {
                var activeLicense = h.Licenses?.FirstOrDefault(l => l.Status == "APPROVED");
                return new MasterHawkerReportDto
                {
                    HawkerId = h.Id,
                    EnrollmentNo = h.EnrollmentNo,
                    FullName = h.FullName,
                    Address = h.Address,
                    Gender = h.Gender,
                    DOB = h.DOB,
                    MobileNumber = h.MobileNumber,
                    HandicapStatus = h.Handicap ? "Yes" : "No",
                    ULBName = h.ULBName,
                    WardName = h.WardName,
                    RoadName = h.RoadName,
                    LandMark = h.LandMark,
                    AreaType = h.AreaType,
                    BusinessType = h.BusinessType,
                    BusinessTime = h.BusinessTime,
                    LocationType = h.LocationType,
                    PartnerDependancy = h.PartnerDependancy,
                    
                    LicenseNumber = activeLicense?.LicenseNumber,
                    LicenseIssueDate = activeLicense?.IssueDate,
                    LicenseExpiryDate = activeLicense?.ExpiryDate,
                    LicenseStatus = activeLicense?.Status
                };
            }).ToList();

            return new PaginatedResult<MasterHawkerReportDto>
            {
                Items = items,
                TotalCount = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<PaginatedResult<RenewedHawkerReportDto>> GetRenewedHawkersReportAsync(string? searchQuery, DateTime? fromDate, DateTime? toDate, string? businessType, int page, int pageSize)
        {
            var query = _context.LicenseRenewals
                .Include(r => r.License)
                .ThenInclude(l => l.Hawker)
                .Where(r => r.Status == "APPROVED")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                query = query.Where(r => r.License.Hawker.FullName.Contains(searchQuery));
            }

            if (fromDate.HasValue)
            {
                query = query.Where(r => r.RenewalDate >= fromDate.Value.Date);
            }

            if (toDate.HasValue)
            {
                query = query.Where(r => r.RenewalDate <= toDate.Value.Date.AddDays(1).AddTicks(-1));
            }

            if (!string.IsNullOrWhiteSpace(businessType))
            {
                query = query.Where(r => r.License.Hawker.BusinessType == businessType);
            }

            var totalItems = await query.CountAsync();
            var renewals = await query
                .OrderByDescending(r => r.RenewalDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = renewals.Select(r => new RenewedHawkerReportDto
            {
                Id = r.Id,
                HawkerId = r.License.HawkerId,
                Name = r.License.Hawker.FullName,
                BusinessType = r.License.Hawker.BusinessType,
                RenewDate = r.RenewalDate,
                ExpiryDate = r.ExpiryDate
            }).ToList();

            return new PaginatedResult<RenewedHawkerReportDto>
            {
                Items = items,
                TotalCount = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        private static HawkerDto MapToDto(Hawker hawker)
        {
            return new HawkerDto
            {
                Id = hawker.Id,
                EnrollmentNo = hawker.EnrollmentNo,
                FullName = hawker.FullName,
                Address = hawker.Address,
                Gender = hawker.Gender,
                DOB = hawker.DOB,
                MobileNumber = hawker.MobileNumber,
                Handicap = hawker.Handicap,
                ULBName = hawker.ULBName,
                WardName = hawker.WardName,
                RoadName = hawker.RoadName,
                LandMark = hawker.LandMark,
                AreaType = hawker.AreaType,
                BusinessType = hawker.BusinessType,
                BusinessTime = hawker.BusinessTime,
                LocationType = hawker.LocationType,
                PartnerDependancy = hawker.PartnerDependancy,
                Status = hawker.Status,
                RejectionReason = hawker.RejectionReason,
                Remarks = hawker.Remarks,
                RejectedBy = hawker.RejectedBy?.Username,
                RejectedDate = hawker.RejectedDate
            };
        }
    }
}
