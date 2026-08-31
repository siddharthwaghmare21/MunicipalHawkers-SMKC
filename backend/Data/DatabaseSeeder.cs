using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await context.Database.MigrateAsync();

            if (!await context.Roles.AnyAsync(r => r.Name == "IT_ADMIN"))
            {
                context.Roles.Add(new Role { Name = "IT_ADMIN" });
            }

            if (!await context.Roles.AnyAsync(r => r.Name == "DEPARTMENT_ADMIN"))
            {
                context.Roles.Add(new Role { Name = "DEPARTMENT_ADMIN" });
            }

            await context.SaveChangesAsync();

            var itAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "IT_ADMIN");
            var deptAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "DEPARTMENT_ADMIN");

            if (itAdminRole != null && !await context.Users.AnyAsync(u => u.Username == "itadmin"))
            {
                context.Users.Add(new User
                {
                    Username = "itadmin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    RoleId = itAdminRole.Id
                });
            }

            if (deptAdminRole != null && !await context.Users.AnyAsync(u => u.Username == "deptadmin"))
            {
                context.Users.Add(new User
                {
                    Username = "deptadmin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    RoleId = deptAdminRole.Id
                });
            }

            await context.SaveChangesAsync();
            if (!context.DocumentTypes.Any())
            {
                var docTypes = new List<DocumentType>
                {
                    new DocumentType { Name = "Aadhar Card", Description = "Aadhar Card (Front and Back)" },
                    new DocumentType { Name = "PAN Card", Description = "PAN Card" },
                    new DocumentType { Name = "Hawker Photo", Description = "Passport size photo of the Hawker" },
                    new DocumentType { Name = "Disability Certificate", Description = "Certificate for handicapped hawkers" },
                    new DocumentType { Name = "Other", Description = "Any other relevant document" }
                };
                context.DocumentTypes.AddRange(docTypes);
                context.SaveChanges();
            }

            // Seed Dummy Data for Development
            if (!context.Hawkers.Any())
            {
                var businessTypes = new[] { "Vegetables", "Fruits", "Fast Food", "Garments", "Electronics", "Toys", "Utensils", "Spices", "Flowers", "Juice Center" };
                var locations = new[] { "Station Road", "Market Area", "Main Chowk", "Temple Area", "Bus Stand", "Highway Touch", "School Road" };
                var statuses = new[] { "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED" };
                
                var documentTypesList = context.DocumentTypes.ToList();
                var deptAdminUser = context.Users.FirstOrDefault(u => u.Username == "deptadmin");

                var hawkerFaker = new Bogus.Faker<Hawker>("en_IND")
                    .RuleFor(h => h.LicenseNumber, f => {
                        var rand = f.Random.Number(100000, 999999);
                        var now = DateTime.Now;
                        return $"{rand}/{now:yyyy}/{now:MMdd}";
                    })
                    .RuleFor(h => h.FullName, f => f.Name.FullName())
                    .RuleFor(h => h.Address, f => f.Address.StreetAddress() + ", " + f.Address.City())
                    .RuleFor(h => h.Gender, f => f.PickRandom("Male", "Female"))
                    .RuleFor(h => h.DOB, f => f.Date.Past(50, DateTime.Now.AddYears(-18)))
                    .RuleFor(h => h.MobileNumber, f => "9" + f.Random.Number(100000000, 999999999).ToString())
                    .RuleFor(h => h.Handicap, f => f.Random.Bool(0.1f)) // 10% chance
                    .RuleFor(h => h.ULBName, "SMKC")
                    .RuleFor(h => h.WardName, f => "Ward " + f.Random.Number(1, 10))
                    .RuleFor(h => h.RoadName, f => f.PickRandom(locations))
                    .RuleFor(h => h.LandMark, f => f.Address.SecondaryAddress())
                    .RuleFor(h => h.AreaType, f => f.PickRandom("Commercial", "Residential", "Mixed"))
                    .RuleFor(h => h.BusinessType, f => f.PickRandom(businessTypes))
                    .RuleFor(h => h.BusinessTime, f => f.PickRandom("Morning", "Evening", "All Day"))
                    .RuleFor(h => h.LocationType, f => f.PickRandom("Fixed", "Mobile"))
                    .RuleFor(h => h.PartnerDependancy, f => f.PickRandom("None", "Spouse", "Children"))
                    .RuleFor(h => h.Status, f => f.PickRandom(statuses));

                var hawkers = hawkerFaker.Generate(50);

                foreach (var hawker in hawkers)
                {
                    if (hawker.Status == "REJECTED")
                    {
                        hawker.RejectionReason = "Incomplete documents.";
                        hawker.RejectedById = deptAdminUser?.Id;
                        hawker.RejectedDate = DateTime.UtcNow.AddDays(-10);
                    }

                    // Generate a document
                    if (documentTypesList.Any())
                    {
                        var docFaker = new Bogus.Faker<Document>()
                            .RuleFor(d => d.DocumentTypeId, f => f.PickRandom(documentTypesList).Id)
                            .RuleFor(d => d.FilePath, f => $"/uploads/dummy_{f.Random.AlphaNumeric(10)}.pdf")
                            .RuleFor(d => d.OriginalFileName, f => f.System.FileName("pdf"))
                            .RuleFor(d => d.ContentType, "application/pdf")
                            .RuleFor(d => d.FileSize, f => f.Random.Number(100000, 5000000))
                            .RuleFor(d => d.Status, f => hawker.Status == "APPROVED" ? "APPROVED" : f.PickRandom("UNDER_REVIEW", "APPROVED", "REJECTED"))
                            .RuleFor(d => d.UploadDate, f => f.Date.Past(1));
                        
                        hawker.Documents.Add(docFaker.Generate());
                    }

                    // If approved, generate a license
                    if (hawker.Status == "APPROVED")
                    {
                        var licenseStatuses = new[] { "ACTIVE", "EXPIRED", "SUSPENDED" };
                        
                        var licenseFaker = new Bogus.Faker<License>()
                            .RuleFor(l => l.LicenseNumber, f => "LIC-" + f.Random.Number(1000, 9999).ToString())
                            .RuleFor(l => l.IssueDate, f => f.Date.Past(2))
                            .RuleFor(l => l.ExpiryDate, (f, l) => l.IssueDate.AddYears(1))
                            .RuleFor(l => l.Status, f => f.PickRandom(licenseStatuses))
                            .RuleFor(l => l.LicenseType, f => f.PickRandom("Temporary", "Permanent"))
                            .RuleFor(l => l.Remarks, "Auto generated for testing");

                        var license = licenseFaker.Generate();

                        // Create renewals for some licenses
                        if (license.Status == "EXPIRED" || new Random().NextDouble() > 0.5)
                        {
                            var renewalFaker = new Bogus.Faker<LicenseRenewal>()
                                .RuleFor(r => r.RenewalDate, f => f.Date.Recent(30))
                                .RuleFor(r => r.ExpiryDate, (f, r) => r.RenewalDate.AddYears(1))
                                .RuleFor(r => r.Status, f => f.PickRandom("UNDER_REVIEW", "APPROVED", "REJECTED"))
                                .RuleFor(r => r.UserId, deptAdminUser?.Id)
                                .RuleFor(r => r.Remarks, "Renewal requested");
                                
                            license.LicenseRenewals.Add(renewalFaker.Generate());
                        }

                        hawker.Licenses.Add(license);
                    }
                }

                context.Hawkers.AddRange(hawkers);
                await context.SaveChangesAsync();
            }
        }
    }
}
