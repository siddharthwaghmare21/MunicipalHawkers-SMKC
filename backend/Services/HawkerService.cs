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

        public HawkerService(ApplicationDbContext context)
        {
            _context = context;
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
                query = query.Where(h => h.Status == "Active");
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

        public async Task<HawkerDto> CreateHawkerAsync(CreateHawkerDto dto)
        {
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
            return MapToDto(hawker);
        }

        public async Task<HawkerDto?> UpdateHawkerAsync(int id, UpdateHawkerDto dto)
        {
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
            return MapToDto(hawker);
        }

        public async Task<HawkerDto?> RejectHawkerAsync(int id, RejectDto dto, int? userId)
        {
            var hawker = await _context.Hawkers.FindAsync(id);
            if (hawker == null) return null;

            if (hawker.Status == "Rejected")
                throw new System.InvalidOperationException("Hawker is already rejected.");

            hawker.Status = "Rejected";
            hawker.RejectionReason = dto.RejectionReason;
            hawker.Remarks = dto.Remarks;
            hawker.RejectedById = userId;
            hawker.RejectedDate = System.DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Reject Hawker",
                UserId = userId,
                Details = $"Hawker {id} rejected. Reason: {dto.RejectionReason}"
            });

            await _context.SaveChangesAsync();
            return MapToDto(hawker);
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
