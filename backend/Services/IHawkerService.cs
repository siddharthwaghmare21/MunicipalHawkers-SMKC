using backend.DTOs;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IHawkerService
    {
        Task<PaginatedResult<HawkerDto>> GetAllHawkersAsync(string? searchQuery = null, string? zoneFilter = null, string? statusFilter = null, int page = 1, int pageSize = 10);
        Task<HawkerDto?> GetHawkerByIdAsync(int id);
        Task<HawkerDto> CreateHawkerAsync(CreateHawkerDto dto);
        Task<HawkerDto?> UpdateHawkerAsync(int id, UpdateHawkerDto dto);
        Task<HawkerDto?> RejectHawkerAsync(int id, RejectDto dto, int? userId);
    }
}
