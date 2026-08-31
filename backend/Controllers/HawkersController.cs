using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
    public class HawkersController : ControllerBase
    {
        private readonly IHawkerService _hawkerService;
        private readonly ILogger<HawkersController> _logger;

        public HawkersController(IHawkerService hawkerService, ILogger<HawkersController> logger)
        {
            _hawkerService = hawkerService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResult<HawkerDto>>>> GetHawkers(
            [FromQuery] string? search = null, 
            [FromQuery] string? zone = null, 
            [FromQuery] string? status = null, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var result = await _hawkerService.GetAllHawkersAsync(search, zone, status, page, pageSize);
            return Ok(ApiResponse<PaginatedResult<HawkerDto>>.Ok(result, "Hawkers retrieved successfully"));
        }

        [HttpGet("report/master")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
        public async Task<IActionResult> GetMasterReport([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hawkerService.GetMasterReportAsync(search, page, pageSize);
            return Ok(ApiResponse<PaginatedResult<MasterHawkerReportDto>>.Ok(result));
        }

        [HttpGet("report/renewed")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
        public async Task<IActionResult> GetRenewedHawkersReport([FromQuery] string? search, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? businessType, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hawkerService.GetRenewedHawkersReportAsync(search, fromDate, toDate, businessType, page, pageSize);
            return Ok(ApiResponse<PaginatedResult<RenewedHawkerReportDto>>.Ok(result));
        }

        [HttpGet("public/{licenseNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> GetPublicHawker(string licenseNumber)
        {
            var hawker = await _hawkerService.GetHawkerByLicenseNumberAsync(licenseNumber);
            if (hawker == null)
            {
                return NotFound(ApiResponse<HawkerDto>.Error($"Hawker with License Number {licenseNumber} not found."));
            }

            // Since this is a public verification endpoint, return the hawker data.
            // The user requested ALL information including Aadhar Number to be visible.
            return Ok(ApiResponse<HawkerDto>.Ok(hawker, "Hawker retrieved successfully"));
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> GetHawker(int id)
        {
            var hawker = await _hawkerService.GetHawkerByIdAsync(id);
            if (hawker == null)
            {
                return NotFound(ApiResponse<HawkerDto>.Error($"Hawker with id {id} not found."));
            }

            return Ok(ApiResponse<HawkerDto>.Ok(hawker, "Hawker retrieved successfully"));
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> CreateHawker([FromBody] CreateHawkerDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;
            try
            {
                var hawker = await _hawkerService.CreateHawkerAsync(dto, userId);
                return CreatedAtAction(nameof(GetHawker), new { id = hawker.Id }, ApiResponse<HawkerDto>.Ok(hawker, "Hawker created successfully"));
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<HawkerDto>.Error(ex.Message));
            }
            catch (DbUpdateException dbEx)
            {
                _logger?.LogError(dbEx, "Database update error in CreateHawker");
                var innerMsg = dbEx.InnerException?.Message ?? dbEx.Message;
                return StatusCode(500, ApiResponse<HawkerDto>.Error($"Database error: {innerMsg}"));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Unexpected error in CreateHawker");
                return StatusCode(500, ApiResponse<HawkerDto>.Error("An unexpected error occurred while creating the hawker."));
            }

        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> UpdateHawker(int id, [FromBody] UpdateHawkerDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var hawker = await _hawkerService.UpdateHawkerAsync(id, dto, userId);
            if (hawker == null)
            {
                return NotFound(ApiResponse<HawkerDto>.Error($"Hawker with id {id} not found."));
            }

            return Ok(ApiResponse<HawkerDto>.Ok(hawker, "Hawker updated successfully"));
        }

        [HttpPost("{id}/reject")]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> RejectHawker(int id, [FromBody] RejectDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

                var hawker = await _hawkerService.RejectHawkerAsync(id, dto, userId);
                if (hawker == null)
                {
                    return NotFound(ApiResponse<HawkerDto>.Error($"Hawker with id {id} not found."));
                }

                return Ok(ApiResponse<HawkerDto>.Ok(hawker, "Hawker rejected successfully"));
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<HawkerDto>.Error(ex.Message));
            }
        }
    }
}
