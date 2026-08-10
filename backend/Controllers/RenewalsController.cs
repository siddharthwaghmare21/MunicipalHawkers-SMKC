using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
    public class RenewalsController : ControllerBase
    {
        private readonly ILicenseRenewalService _renewalService;

        public RenewalsController(ILicenseRenewalService renewalService)
        {
            _renewalService = renewalService;
        }

        [HttpGet("license/{licenseId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<LicenseRenewalDto>>>> GetRenewalsForLicense(int licenseId)
        {
            var renewals = await _renewalService.GetRenewalsForLicenseAsync(licenseId);
            return Ok(new ApiResponse<IEnumerable<LicenseRenewalDto>>
            {
                Success = true,
                Message = "Renewals retrieved successfully",
                Data = renewals
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<LicenseDto>>> ProcessRenewal([FromBody] CreateLicenseRenewalDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var result = await _renewalService.ProcessRenewalAsync(dto, userId);
            if (result == null)
            {
                return NotFound(new ApiResponse<LicenseDto>
                {
                    Success = false,
                    Message = "License not found."
                });
            }

            return Ok(new ApiResponse<LicenseDto>
            {
                Success = true,
                Message = "License renewed successfully",
                Data = result
            });
        }
    }
}
