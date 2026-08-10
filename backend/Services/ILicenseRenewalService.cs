using backend.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface ILicenseRenewalService
    {
        Task<IEnumerable<LicenseRenewalDto>> GetRenewalsForLicenseAsync(int licenseId);
        Task<LicenseDto?> ProcessRenewalAsync(CreateLicenseRenewalDto dto, int? userId);
    }
}
