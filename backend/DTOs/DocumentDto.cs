using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class DocumentDto
    {
        public int Id { get; set; }
        public int HawkerId { get; set; }
        public int DocumentTypeId { get; set; }
        public string DocumentTypeName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Remarks { get; set; }
        public DateTime UploadDate { get; set; }
    }

    public class UploadDocumentDto
    {
        [Required]
        public int HawkerId { get; set; }
        
        [Required]
        public int DocumentTypeId { get; set; }
        
        [Required]
        public IFormFile File { get; set; } = null!;
    }

    public class VerifyDocumentDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // Verified, Rejected
        
        public string? Remarks { get; set; }
    }
}
