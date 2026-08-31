using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Services
{
    public interface ILicenseNumberGenerator
    {
        Task<string> GenerateAsync(ApplicationDbContext context, DateTime creationDate);
    }

    public class LicenseNumberGenerator : ILicenseNumberGenerator
    {
        private static readonly Random _random = new Random();

        public async Task<string> GenerateAsync(ApplicationDbContext context, DateTime creationDate)
        {
            const int maxRetries = 5;
            for (int i = 0; i < maxRetries; i++)
            {
                int randomPart = _random.Next(100000, 1000000);
                string licenseNumber = $"{randomPart}/{creationDate:yyyy}/{creationDate:MMdd}";

                // Application-level uniqueness check
                bool exists = await context.Hawkers.AnyAsync(h => h.LicenseNumber == licenseNumber);
                if (!exists)
                {
                    return licenseNumber;
                }
            }

            throw new InvalidOperationException("Failed to generate a unique License Number after 5 attempts due to persistent collisions.");
        }
    }
}
