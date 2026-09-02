using backend.Data;
using backend.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var normalizedUsername = request.Username?.Trim().ToLowerInvariant() ?? string.Empty;
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);
            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid username or password" };
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return new LoginResponse { Success = false, Message = "Invalid username or password" };
            }

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                Username = user.Username,
                Role = user.Role?.Name ?? string.Empty
            };
        }

        private string GenerateJwtToken(Entities.User user)
        {
            var jwtSecret = _configuration["JWT_SECRET"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
            if (string.IsNullOrEmpty(jwtSecret))
            {
                throw new InvalidOperationException("JWT_SECRET is not configured.");
            }

            var jwtIssuer = _configuration["JWT_ISSUER"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "MunicipalHawkers";
            var jwtAudience = _configuration["JWT_AUDIENCE"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "MunicipalHawkersClients";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            if (user.Role != null)
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Role.Name));
            }

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
