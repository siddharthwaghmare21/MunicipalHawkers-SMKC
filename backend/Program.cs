using backend.Data;
using backend.Middleware;
using backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    var password = userInfo.Length > 1 ? userInfo[1] : "";
    connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={password};SslMode=Require;Trust Server Certificate=true;";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException("Database connection string is missing.");
    }
    
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.SetIsOriginAllowed(_ => true)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
});

// Configure Dependency Injection
builder.Services.AddScoped<IHawkerService, HawkerService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<ILicenseRenewalService, LicenseRenewalService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? Environment.GetEnvironmentVariable("JWT_SECRET");
if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException("JWT_SECRET is not configured.");
}

var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "MunicipalHawkers";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "MunicipalHawkersClients";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// Add Controllers and HealthChecks
builder.Services.AddControllers();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Seed Database
try
{
    await DatabaseSeeder.SeedAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while seeding the database.");
}

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
