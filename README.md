# MunicipalHawkers - SMKC

An Enterprise Resource Planning (ERP) application for managing municipal hawker licenses, built with a Next.js frontend and an ASP.NET Core backend.

## Project Architecture

This project is structured as a monorepo containing two main components:
- `frontend/`: A modern React application built with Next.js (App Router), Tailwind CSS, and Lucide React.
- `backend/`: A robust REST API built with ASP.NET Core 8.0, Entity Framework Core, and MySQL.

## Prerequisites

- Node.js (v18+)
- .NET 8.0 SDK
- MySQL Server (v8+)

## Setup Instructions

### 1. Database Setup (MySQL)

1. Ensure MySQL is running on your local machine.
2. Create a new database scheme for the application (e.g., `smkc_db`).
3. You will configure the connection string in the backend setup step.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create an `.env` file based on `.env.example` (or use the template below):
   ```env
   # Database connection
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_local_password
   DB_NAME=smkc_db

   # JWT Security (Use a long, random secret in production)
   JWT_SECRET=your_super_secret_development_key_for_jwt_auth_123!
   JWT_ISSUER=SMKC
   JWT_AUDIENCE=SMKC_Users

   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:3000
   ```
3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the backend API:
   ```bash
   dotnet run
   ```
   The backend will start at `http://localhost:5109`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5109/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:3000`.

## Default Credentials (Development)

The database includes a seeder that creates default administrative accounts on startup if none exist.
Do not use these credentials in a production environment.

- **IT Admin:** `itadmin` / `Admin@123`
- **Department Admin:** `deptadmin` / `Admin@123`

## API Documentation

The backend API follows RESTful principles. Authentication is handled via JWT Bearer tokens.

### Key Endpoints
- `POST /api/Auth/login` - Authenticate and retrieve a JWT token.
- `GET /api/Dashboard/stats` - Retrieve high-level statistics for the dashboard.
- `GET /api/Hawkers` - Retrieve paginated and filtered hawker records.
- `POST /api/Hawkers` - Register a new hawker.
- `POST /api/Hawkers/{id}/reject` - Reject a hawker application.
- `GET /api/Licenses` - Manage issued licenses.
- `GET /api/Licenses/{id}/renew` - Process license renewals.
- `POST /api/Documents/upload` - Upload supporting documentation.
- `GET /api/AuditLogs` - Retrieve system audit logs (IT Admin only).

## Security Notes

- This repository is configured to ignore sensitive files such as `.env` files, build output (`bin/`, `obj/`, `.next/`), and user upload directories.
- Always regenerate the `JWT_SECRET` in a production environment.
- Never commit actual database credentials or API keys.

---
*Maintained by the IT Department, Sangli-Miraj-Kupwad City Municipal Corporation.*
