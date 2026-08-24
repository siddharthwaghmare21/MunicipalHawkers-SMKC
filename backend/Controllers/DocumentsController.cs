using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost("upload")]
        [AllowAnonymous]
        public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentDto uploadDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out int uid) ? uid : null;
                    
                var result = await _documentService.UploadDocumentAsync(uploadDto, userId);
                return Ok(ApiResponse<DocumentDto>.Ok(result, "Document uploaded successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        [HttpGet("hawker/{hawkerId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDocumentsByHawkerId(int hawkerId)
        {
            try
            {
                var documents = await _documentService.GetDocumentsByHawkerIdAsync(hawkerId);
                return Ok(ApiResponse<IEnumerable<DocumentDto>>.Ok(documents, "Documents retrieved successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        [HttpGet("download/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var (fileBytes, contentType, fileName) = await _documentService.DownloadDocumentAsync(id);
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                await _documentService.DeleteDocumentAsync(id);
                return Ok(ApiResponse<object>.Ok(null, "Document deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        [HttpPut("{id}/verify")]
        [Authorize(Roles = "IT_ADMIN,DEPARTMENT_ADMIN")]
        public async Task<IActionResult> VerifyDocument(int id, [FromBody] VerifyDocumentDto verifyDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized("User ID not found in token");
                    
                var result = await _documentService.VerifyDocumentAsync(id, verifyDto, userId);
                return Ok(ApiResponse<DocumentDto>.Ok(result, "Document verified successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }
    }
}
