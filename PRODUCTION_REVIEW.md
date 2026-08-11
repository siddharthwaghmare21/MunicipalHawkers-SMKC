# MunicipalHawkers - SMKC: Production-Readiness Review

This document outlines the final production-readiness review for the MunicipalHawkers - SMKC ERP system. It covers all necessary environmental, security, and infrastructure requirements required before deploying the application to a production environment (even if hosted locally).

---

## 1. Production Checklist

### Frontend (Next.js)
- [ ] Build the optimized production bundle (`npm run build`).
- [ ] Ensure all environment variables (`NEXT_PUBLIC_API_URL`) point to the production API.
- [ ] Verify image optimization settings and caching.
- [ ] Test cross-browser compatibility and responsive UI across all targeted devices (Mobile, Tablet, Desktop).

### Backend (ASP.NET Core)
- [ ] Run application in `Production` environment to disable Swagger and detailed developer exceptions.
- [ ] Apply all Entity Framework migrations to the production MySQL database (`dotnet ef database update`).
- [ ] Ensure `GlobalExceptionMiddleware` is active to mask internal stack traces from users.
- [ ] Configure structured logging (e.g., Serilog or built-in logging directed to a file).
- [ ] Configure `appsettings.Production.json` (overriding Development settings).

### Security & Compliance
- [ ] Generate a highly secure, 64+ character `JWT_SECRET`.
- [ ] Restrict CORS specifically to the production Frontend URL.
- [ ] Enable HTTPS redirection and enforce TLS 1.2+ across the API and Frontend.
- [ ] Ensure database credentials are not stored in source code, but injected securely via environment variables.

### Infrastructure
- [ ] Configure a reverse proxy (e.g., Nginx, IIS) to host the ASP.NET Core API.
- [ ] Set up PM2 or a systemd service to keep the Next.js frontend running.
- [ ] Provision a dedicated mount path for the `uploads/` directory to prevent data loss during deployments.

---

## 2. Required Environment Variables

### Backend (`.env` or Server Environment Variables)
```env
ASPNETCORE_ENVIRONMENT=Production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=<production_db_user>
DB_PASSWORD=<strong_production_password>
DB_NAME=smkc_erp_prod

JWT_SECRET=<generate_a_cryptographically_secure_random_string>
JWT_ISSUER=SMKC_Production
JWT_AUDIENCE=SMKC_Users

# Must strictly match the frontend's address
FRONTEND_URL=https://your-production-domain.com
```

### Frontend (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://your-production-api-domain.com/api
```

---

## 3. Server Requirements

Since the system will initially remain on localhost, a single standard server (or Virtual Machine) is sufficient.
- **OS**: Windows Server, Ubuntu 22.04 LTS, or Debian 12.
- **Processor**: 2+ Cores (4+ recommended for concurrent loads).
- **RAM**: 4GB Minimum (8GB recommended to accommodate Next.js SSR, ASP.NET API, and MySQL simultaneously).
- **Software Dependencies**: Node.js (v18+), .NET 8.0 Runtime/Hosting Bundle.

---

## 4. MySQL Requirements

- **Version**: MySQL 8.0+.
- **Indexes**: The Entity Framework migrations automatically generate indexes for unique identifiers (`EnrollmentNo`, `LicenseNo`).
- **Configuration**:
  - Set `max_connections` to at least 200.
  - Enable binary logging (`log_bin`) for point-in-time recovery if required.
- **Security**: Create a dedicated `smkc_app_user` with restricted privileges (only `SELECT`, `INSERT`, `UPDATE`, `DELETE` on the `smkc_erp_prod` database). Do not use the `root` account for the application.

---

## 5. Backup Requirements

### Database Backups
- **Frequency**: Daily automated backups via `mysqldump`.
- **Retention**: Keep daily backups for 7 days, weekly for 4 weeks, and monthly for 1 year.
- **Storage**: Store backups in an isolated physical drive or a secure cloud bucket (e.g., AWS S3, Azure Blob).

### File Uploads Backups
- **Frequency**: Daily sync of the backend `uploads/` directory.
- **Strategy**: Incremental backups (using tools like `rsync` or Azure/AWS backup agents) to avoid heavy disk I/O.

---

## 6. File Storage Requirements

- **Local Storage**: The application writes uploaded documents (PDFs, Images) to the backend `uploads/` directory.
- **Permissions**: The user running the backend process (e.g., `www-data` or specific Windows AppPool Identity) must have exclusive Read/Write permissions to this folder.
- **Volume Isolation**: It is highly recommended to symlink or mount the `uploads/` folder to a separate logical drive. This prevents disk exhaustion on the primary OS drive in the event of mass uploads.

---

## 7. Security Requirements

- **HTTPS**: Traffic must be encrypted. If remaining on localhost for production, use a self-signed certificate or IIS Express defaults. If exposed externally, use Let's Encrypt or a corporate CA.
- **Authentication**: JWT is implemented. Passwords are mathematically hashed using BCrypt.
- **Authorization**: Role-based access control (RBAC) restricts endpoints to `IT_ADMIN` and `DEPARTMENT_ADMIN`.
- **File Upload Security**: The backend validates file extensions (PDF, JPG, PNG) and sizes (< 5MB), and randomizes filenames (GUID) to prevent directory traversal or script execution.
- **Audit Logging**: All critical changes to Hawkers, Licenses, and Documents are logged permanently in the `AuditLogs` table.

---

## 8. Deployment Steps (Localhost Production)

Even if keeping the application on `localhost`, it should be run in a production-like state rather than development mode.

**Step 1: Database Setup**
1. Create the production database and user in MySQL.
2. Provide the credentials to the Backend environment variables.
3. Run `dotnet ef database update` from the backend directory to build the schema.

**Step 2: Deploy Backend**
1. Open PowerShell and navigate to `/backend`.
2. Run: `dotnet publish -c Release -o ./publish`
3. Serve the `/publish` directory using IIS (on Windows) or Kestrel directly (`dotnet backend.dll`) with `ASPNETCORE_ENVIRONMENT=Production`.

**Step 3: Deploy Frontend**
1. Open PowerShell and navigate to `/frontend`.
2. Ensure `.env.production` contains `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (or whichever port the published backend runs on).
3. Run: `npm run build`
4. Run: `npm run start` (Starts the optimized production Node server on port 3000).

---

## 9. Rollback Considerations

If an update breaks the production system:
1. **Frontend Rollback**: Revert to the previous Git commit, run `npm run build`, and restart the frontend server.
2. **Backend Rollback**: Revert to the previous Git commit and republish the DLLs.
3. **Database Rollback**:
   - Entity Framework migrations can be rolled back using `dotnet ef database update <Previous_Migration_Name>`.
   - **Warning**: Rolling back migrations can cause data loss for columns/tables introduced in the broken update. Always take a `mysqldump` immediately before deploying a new version to allow for a full state restoration.
