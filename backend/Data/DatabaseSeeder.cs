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
        }
    }
}
