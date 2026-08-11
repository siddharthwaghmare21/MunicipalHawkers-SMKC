using backend.DTOs;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IDocumentService
    {
        Task<DocumentDto> UploadDocumentAsync(UploadDocumentDto uploadDto, int uploadedByUserId);
        Task<IEnumerable<DocumentDto>> GetDocumentsByHawkerIdAsync(int hawkerId);
        Task<(byte[] FileBytes, string ContentType, string FileName)> DownloadDocumentAsync(int documentId);
        Task DeleteDocumentAsync(int documentId);
        Task<DocumentDto> VerifyDocumentAsync(int documentId, VerifyDocumentDto verifyDto, int verifiedByUserId);
    }
}
