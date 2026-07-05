# Intern Management Portal — Deployment Guide

This guide details the procedures for deploying the Intern Management Portal to production environments (Docker / Cloud VMs / AWS).

## 1. Production Database Preparation (PostgreSQL)
1. Provision a production PostgreSQL instance (e.g., AWS RDS PostgreSQL 15+).
2. Connect using `psql` or pgAdmin and execute `db/schema.sql`.
3. Execute `db/seed.sql` to initialize default system roles and initial Admin user.
4. Set strong environment variables for your database credentials:
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://<prod-db-host>:5432/internportal`
   - `SPRING_DATASOURCE_USERNAME=<prod_db_user>`
   - `SPRING_DATASOURCE_PASSWORD=<secure_password>`

## 2. Backend Deployment (Spring Boot JAR / Docker)
1. Set the production JWT Secret key (at least 256-bit secure hex/base64 string):
   - `APP_JWT_SECRET=8f9d2a3c4b5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1`
2. Build the production executable JAR:
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
3. Run the application service:
   ```bash
   java -jar -Dspring.profiles.active=prod target/intern-portal-backend-1.0.0.jar
   ```

## 3. Storage Migration to AWS S3
In development, uploaded screenshots are stored on the local file system. To migrate to AWS S3:
1. Implement `S3StorageServiceImpl` implementing the core `StorageService` interface.
2. Inject AWS SDK v2 dependencies (`software.amazon.awssdk:s3`).
3. Set the active storage bean profile to `@Profile("prod")` or configure properties via `app.storage.type=s3`.

## 4. Frontend Deployment (Nginx / Cloudflare Pages / Vercel)
1. Build the production React bundle:
   ```bash
   cd frontend
   npm install
   VITE_API_BASE_URL=https://api.yourdomain.com npm run build
   ```
2. Deploy the generated `dist/` directory to your web server or CDN.
3. Configure reverse proxy routing in Nginx to redirect `/api/*` to the Spring Boot backend instance on port 8080.
