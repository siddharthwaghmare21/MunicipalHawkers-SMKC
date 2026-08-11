using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
    public class LicensesController : ControllerBase
    {
        private readonly ILicenseService _licenseService;

        public LicensesController(ILicenseService licenseService)
        {
            _licenseService = licenseService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResult<LicenseDto>>>> GetLicenses(
            [FromQuery] string? search = null, 
            [FromQuery] string? status = null, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var result = await _licenseService.GetAllLicensesAsync(search, status, page, pageSize);
            return Ok(ApiResponse<PaginatedResult<LicenseDto>>.Ok(result, "Licenses retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<LicenseDto>>> GetLicense(int id)
        {
            var license = await _licenseService.GetLicenseByIdAsync(id);
            if (license == null)
            {
                return NotFound(ApiResponse<LicenseDto>.Error($"License with id {id} not found."));
            }

            return Ok(ApiResponse<LicenseDto>.Ok(license, "License retrieved successfully"));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<LicenseDto>>> CreateLicense([FromBody] CreateLicenseDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var license = await _licenseService.CreateLicenseAsync(dto, userId);
            return CreatedAtAction(nameof(GetLicense), new { id = license.Id }, ApiResponse<LicenseDto>.Ok(license, "License created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<LicenseDto>>> UpdateLicense(int id, [FromBody] UpdateLicenseDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var license = await _licenseService.UpdateLicenseAsync(id, dto, userId);
            if (license == null)
            {
                return NotFound(ApiResponse<LicenseDto>.Error($"License with id {id} not found."));
            }

            return Ok(ApiResponse<LicenseDto>.Ok(license, "License updated successfully"));
        }

        [HttpPost("{id}/reject")]
        public async Task<ActionResult<ApiResponse<LicenseDto>>> RejectLicense(int id, [FromBody] RejectDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

                var license = await _licenseService.RejectLicenseAsync(id, dto, userId);
                if (license == null)
                {
                    return NotFound(ApiResponse<LicenseDto>.Error($"License with id {id} not found."));
                }

                return Ok(ApiResponse<LicenseDto>.Ok(license, "License rejected successfully"));
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<LicenseDto>.Error(ex.Message));
            }
        }
    }
}
