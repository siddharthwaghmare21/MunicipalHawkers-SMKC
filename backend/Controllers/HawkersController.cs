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
    public class HawkersController : ControllerBase
    {
        private readonly IHawkerService _hawkerService;

        public HawkersController(IHawkerService hawkerService)
        {
            _hawkerService = hawkerService;
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
            return Ok(new ApiResponse<PaginatedResult<HawkerDto>>
            {
                Success = true,
                Message = "Hawkers retrieved successfully",
                Data = result
            });
        }

        [HttpGet("report/master")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN,CLERK")]
        public async Task<IActionResult> GetMasterReport([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hawkerService.GetMasterReportAsync(search, page, pageSize);
            return Ok(result);
        }

        [HttpGet("report/renewed")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN,CLERK")]
        public async Task<IActionResult> GetRenewedHawkersReport([FromQuery] string? search, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? businessType, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _hawkerService.GetRenewedHawkersReportAsync(search, fromDate, toDate, businessType, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> GetHawker(int id)
        {
            var hawker = await _hawkerService.GetHawkerByIdAsync(id);
            if (hawker == null)
            {
                return NotFound(new ApiResponse<HawkerDto>
                {
                    Success = false,
                    Message = $"Hawker with id {id} not found."
                });
            }

            return Ok(new ApiResponse<HawkerDto>
            {
                Success = true,
                Message = "Hawker retrieved successfully",
                Data = hawker
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> CreateHawker([FromBody] CreateHawkerDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var hawker = await _hawkerService.CreateHawkerAsync(dto, userId);
            return CreatedAtAction(nameof(GetHawker), new { id = hawker.Id }, new ApiResponse<HawkerDto>
            {
                Success = true,
                Message = "Hawker created successfully",
                Data = hawker
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<HawkerDto>>> UpdateHawker(int id, [FromBody] UpdateHawkerDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

            var hawker = await _hawkerService.UpdateHawkerAsync(id, dto, userId);
            if (hawker == null)
            {
                return NotFound(new ApiResponse<HawkerDto>
                {
                    Success = false,
                    Message = $"Hawker with id {id} not found."
                });
            }

            return Ok(new ApiResponse<HawkerDto>
            {
                Success = true,
                Message = "Hawker updated successfully",
                Data = hawker
            });
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
                    return NotFound(new ApiResponse<HawkerDto>
                    {
                        Success = false,
                        Message = $"Hawker with id {id} not found."
                    });
                }

                return Ok(new ApiResponse<HawkerDto>
                {
                    Success = true,
                    Message = "Hawker rejected successfully",
                    Data = hawker
                });
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<HawkerDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
}
