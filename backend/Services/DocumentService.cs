using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadDirectory;
        private readonly IAuditLogService _auditLogService;

        public DocumentService(ApplicationDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
            // Secure upload directory outside web root
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "SecureUploads");
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        public async Task<DocumentDto> UploadDocumentAsync(UploadDocumentDto uploadDto, int? uploadedByUserId)
        {
            var hawker = await _context.Hawkers.FindAsync(uploadDto.HawkerId);
            if (hawker == null) throw new Exception("Hawker not found");

            var docType = await _context.DocumentTypes.FindAsync(uploadDto.DocumentTypeId);
            if (docType == null) throw new Exception("Document Type not found");

            // Basic validation
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var extension = Path.GetExtension(uploadDto.File.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                throw new Exception("Invalid file type. Allowed types: jpg, jpeg, png, pdf");

            if (uploadDto.File.Length > 5 * 1024 * 1024) // 5MB limit for now
                throw new Exception("File size exceeds 5MB limit");

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(uploadDto.File.FileName)}";
            var filePath = Path.Combine(_uploadDirectory, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await uploadDto.File.CopyToAsync(stream);
            }

            var document = new Document
            {
                HawkerId = uploadDto.HawkerId,
                DocumentTypeId = uploadDto.DocumentTypeId,
                FilePath = uniqueFileName, // Only store filename, not absolute path
                OriginalFileName = uploadDto.File.FileName,
                ContentType = uploadDto.File.ContentType,
                FileSize = uploadDto.File.Length,
                UploadDate = DateTime.UtcNow,
                Status = "UNDER_REVIEW"
            };

            _context.Documents.Add(document);
            
            await _auditLogService.LogActionAsync(uploadedByUserId, "Upload Document", "Document", document.Id.ToString(), $"Uploaded {docType.Name} for Hawker ID {uploadDto.HawkerId}. Document ID: {document.Id}");

            await _context.SaveChangesAsync();

            return MapToDto(document, docType.Name);
        }

        public async Task<IEnumerable<DocumentDto>> GetDocumentsByHawkerIdAsync(int hawkerId)
        {
            var documents = await _context.Documents
                .Include(d => d.DocumentType)
                .Where(d => d.HawkerId == hawkerId)
                .ToListAsync();

            return documents.Select(d => MapToDto(d, d.DocumentType.Name));
        }

        public async Task<(byte[] FileBytes, string ContentType, string FileName)> DownloadDocumentAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null) throw new Exception("Document not found");

            var filePath = Path.Combine(_uploadDirectory, document.FilePath);
            if (!File.Exists(filePath)) throw new Exception("File not found on server");

            var bytes = await File.ReadAllBytesAsync(filePath);
            return (bytes, document.ContentType, document.OriginalFileName);
        }

        public async Task DeleteDocumentAsync(int documentId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null) throw new Exception("Document not found");

            var filePath = Path.Combine(_uploadDirectory, document.FilePath);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
        }

        public async Task<DocumentDto> VerifyDocumentAsync(int documentId, VerifyDocumentDto verifyDto, int verifiedByUserId)
        {
            var document = await _context.Documents
                .Include(d => d.DocumentType)
                .FirstOrDefaultAsync(d => d.Id == documentId);
                
            if (document == null) throw new Exception("Document not found");

            document.Status = verifyDto.Status;
            document.Remarks = verifyDto.Remarks;

            await _auditLogService.LogActionAsync(verifiedByUserId, $"Verify Document: {verifyDto.Status}", "Document", document.Id.ToString(), $"Document ID: {document.Id}. Status updated to {verifyDto.Status}. Remarks: {verifyDto.Remarks}");

            await _context.SaveChangesAsync();
            return MapToDto(document, document.DocumentType.Name);
        }

        private DocumentDto MapToDto(Document document, string documentTypeName)
        {
            return new DocumentDto
            {
                Id = document.Id,
                HawkerId = document.HawkerId,
                DocumentTypeId = document.DocumentTypeId,
                DocumentTypeName = documentTypeName,
                OriginalFileName = document.OriginalFileName,
                ContentType = document.ContentType,
                FileSize = document.FileSize,
                Status = document.Status,
                Remarks = document.Remarks,
                UploadDate = document.UploadDate
            };
        }
    }
}
