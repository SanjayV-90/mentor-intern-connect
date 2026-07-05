# Enterprise Intern Management Portal

An enterprise-grade, full-stack management portal designed for monitoring intern performance, learning progress, coding assignments, attendance, daily tasks, and Duolingo language streaks.

Built following Clean Architecture, SOLID principles, and strict 3NF PostgreSQL database normalization.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components, TanStack Query, React Hook Form + Zod, Recharts.
- **Backend**: Java 21, Spring Boot 3.3, Spring Security 6 (JWT stateless auth + Refresh tokens), Spring Data JPA, Hibernate, MapStruct, OpenAPI Swagger.
- **Database**: PostgreSQL 15+ (13 normalized tables in 3NF).

## Folder Structure
```
├── db/                  # PostgreSQL 3NF Schema & Seeding Scripts
│   ├── schema.sql       # DDL table creation, indexes, and constraints
│   └── seed.sql         # Seed admin and sample intern records
├── docs/                # Architecture & API Specifications
│   └── ARCHITECTURE.md  # Detailed system diagrams & REST contracts
├── backend/             # Spring Boot 3 / Java 21 Maven Application
└── frontend/            # React + TypeScript Vite Single Page Application
```

## Quick Start
1. **Database Setup**:
   Execute `db/schema.sql` and `db/seed.sql` on your PostgreSQL server.
2. **Backend Server**:
   Navigate to `backend/` and run `mvn spring-boot:run`. Server starts at `http://localhost:8080`.
   Swagger API documentation: `http://localhost:8080/swagger-ui.html`.
3. **Frontend Application**:
   Navigate to `frontend/`, run `npm install` and `npm run dev`. App runs at `http://localhost:5173`.

## Default Credentials
- **Admin Role**: `admin@portal.com` / `Admin@12345`
- **Active Intern Role**: `alex.intern@gmail.com` / `Admin@12345`
