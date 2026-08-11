using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<Hawker> Hawkers { get; set; } = null!;
        public DbSet<License> Licenses { get; set; } = null!;
        public DbSet<LicenseRenewal> LicenseRenewals { get; set; } = null!;
        public DbSet<DocumentType> DocumentTypes { get; set; } = null!;
        public DbSet<Document> Documents { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Hawker>()
                .HasIndex(h => h.EnrollmentNo)
                .IsUnique();

            modelBuilder.Entity<DocumentType>().HasData(
                new DocumentType { Id = 1, Name = "Aadhar Card", Description = "National Identity Card" },
                new DocumentType { Id = 2, Name = "Photo", Description = "Passport size photograph" },
                new DocumentType { Id = 3, Name = "PAN Card", Description = "Permanent Account Number Card" },
                new DocumentType { Id = 4, Name = "Voter ID", Description = "Voter Identity Card" },
                new DocumentType { Id = 5, Name = "Ration Card", Description = "Household Ration Card" }
            );
        }
    }
}
