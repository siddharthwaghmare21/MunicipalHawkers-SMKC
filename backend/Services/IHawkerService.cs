using backend.DTOs;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IHawkerService
    {
        Task<PaginatedResult<HawkerDto>> GetAllHawkersAsync(string? searchQuery = null, string? zoneFilter = null, string? statusFilter = null, int page = 1, int pageSize = 10);
        Task<HawkerDto?> GetHawkerByIdAsync(int id);
        Task<HawkerDto?> GetHawkerByEnrollmentNoAsync(string enrollmentNo);
        Task<HawkerDto> CreateHawkerAsync(CreateHawkerDto dto, int? userId);
        Task<HawkerDto?> UpdateHawkerAsync(int id, UpdateHawkerDto dto, int? userId);
        Task<HawkerDto?> RejectHawkerAsync(int id, RejectDto dto, int? userId);
        Task<PaginatedResult<MasterHawkerReportDto>> GetMasterReportAsync(string? searchQuery = null, int page = 1, int pageSize = 10);
        Task<PaginatedResult<RenewedHawkerReportDto>> GetRenewedHawkersReportAsync(string? searchQuery = null, DateTime? fromDate = null, DateTime? toDate = null, string? businessType = null, int page = 1, int pageSize = 10);
    }
}
