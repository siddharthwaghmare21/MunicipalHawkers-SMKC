# MunicipalHawkers - SMKC

## Project Overview
Municipal Hawker License Management System for Sangli, Miraj and Kupwad City Municipal Corporation (SMKC).

## Project Structure
- `/frontend` - Next.js (App Router), React, TypeScript, Tailwind CSS
- `/backend` - ASP.NET Core Web API (C#)
- `/database` - MySQL scripts and Entity Framework Core migrations
- `/docs` - Architecture, APIs, and setup documentation

## Prerequisites
- Node.js (v18+)
- .NET 8 SDK
- MySQL Server

## Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

### Backend
```bash
cd backend
dotnet run
```
Runs on `http://localhost:5000` (or configured port)
