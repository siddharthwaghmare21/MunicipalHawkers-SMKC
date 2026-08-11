using backend.DTOs;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface ILicenseService
    {
        Task<PaginatedResult<LicenseDto>> GetAllLicensesAsync(string? searchQuery = null, string? statusFilter = null, int page = 1, int pageSize = 10);
        Task<LicenseDto?> GetLicenseByIdAsync(int id);
        Task<LicenseDto> CreateLicenseAsync(CreateLicenseDto dto, int? userId);
        Task<LicenseDto?> UpdateLicenseAsync(int id, UpdateLicenseDto dto, int? userId);
        Task<LicenseDto?> RejectLicenseAsync(int id, RejectDto dto, int? userId);
    }
}
