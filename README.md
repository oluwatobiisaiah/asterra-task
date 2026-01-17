# AsterrA Task Project Documentation

This project consists of two main sections: a Python data processing suite and a full-stack web application for user and hobby management.

## Project Overview

The project demonstrates skills in data analysis, image processing, and modern web development. The Python section handles educational data processing and raster manipulation, while the web section provides a type-safe, scalable application using contemporary technologies.

## Python Section

### Remote Sensing Course Grades (`python-section/remote-sensing-course-grades/`)

**Purpose:** Processes student grades from multiple sources and computes final grades with weighted averages.

**Implementation Details:**
- **Libraries:** Pandas for data manipulation, JSON for student data parsing.
- **Data Sources:** CSV files for homework/exams and quizzes, JSON for student information.
- **Thought Process:** 
  - Normalize student IDs to lowercase for consistent merging.
  - Handle missing data with `errors='coerce'` in numeric conversions.
  - Compute averages for homework and quizzes.
  - Apply grading weights: 10% homework, 25% quizzes, 65% exam.
  - Output organized by student groups in Excel format.
- **How to Run:** `python solution.py` (requires assets in `assets/` folder).

**Output:** `final_grades.xlsx` with sheets per group, sorted by final grade.

### Raster Manipulation (`python-section/raster-manipulation/`)

**Purpose:** Simulates remote sensing data processing with logarithmic transformation and conditional scaling.

**Implementation Details:**
- **Libraries:** NumPy for array operations, Matplotlib for visualization.
- **Process:**
  - Generate synthetic 16-bit raster data (1000x10000).
  - Apply log10 transformation (scaled by 10) for values > 0.
  - Double values below 13 dB threshold.
  - Normalize to 0-255 for grayscale image display.
- **Thought Process:** Mimics SAR (Synthetic Aperture Radar) processing where log scaling enhances dynamic range, and thresholding highlights low-intensity features. Reproducibility ensured with fixed seed.
- **How to Run:** `python solution.py`.

**Output:** `processed_log_image.png` - grayscale visualization of processed data.

## Web Section

### Overview
A monorepo full-stack application using modern TypeScript ecosystem for managing users and their hobbies.

**Tech Stack:**
- **Backend:** Node.js, Express, tRPC, Drizzle ORM, PostgreSQL
- **Frontend:** React 18, Vite, Tailwind CSS v4, React Hook Form
- **Tooling:** pnpm workspace, TypeScript

### Architecture Decisions
- **tRPC:** Chosen for end-to-end type safety, eliminating API contracts and reducing boilerplate.
- **Drizzle ORM:** Lightweight, type-safe SQL queries with schema migration support.
- **Tailwind v4:** Zero-config styling with modern CSS features.
- **Monorepo:** pnpm workspaces for shared tooling and efficient dependency management.
- **Database Schema:** Users table with hobbies as dependent entities (cascading deletes).

### Key Features
- Type-safe API communication
- Form validation with Zod schemas
- Paginated data display
- Real-time UI updates via TanStack Query
- Responsive design with Tailwind

### CI/CD Pipeline (GitHub Actions)

**Workflow Overview:**
- **Triggers:** Push/PR to main branch.
- **CI Job:** Type checking, linting, and building both apps.
- **Deployment:**
  - **Backend:** Dockerized, deployed to AWS App Runner via ECR.
  - **Frontend:** Static build deployed to S3 + CloudFront.

**Thought Process:**
- Separate CI and deployment jobs for faster feedback.
- Use AWS managed services for scalability and cost-efficiency.
- Environment variables injected securely via GitHub secrets.
- Cache dependencies for faster builds.
- Wait for deployment completion to ensure reliability.

**Required Secrets:**
- AWS credentials, DB connection details, S3 bucket, CloudFront distribution ID, App Runner service ARN.

### How to Run Locally

1. **Prerequisites:** Node.js 20, pnpm 9, PostgreSQL database.

2. **Setup:**
   ```bash
   cd web
   pnpm install
   ```

3. **Database:** Configure PostgreSQL (local or AWS RDS), update `apps/backend/.env`.

4. **Migrate Schema:**
   ```bash
   pnpm db:push
   ```

5. **Development:**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

6. **Build for Production:**
   ```bash
   pnpm build
   ```

Refer to `web/README.md` for detailed commands and troubleshooting.

## Overall Thought Process

- **Modularity:** Separate concerns between data processing (Python) and web application.
- **Best Practices:** Type safety, testing (implied in CI), scalable architecture.
- **Deployment:** Automated pipeline ensures consistent releases.
- **Data Handling:** Robust error handling in Python scripts, normalized processing.
- **Web Design:** User-centric with pagination, validation, and responsive UI.

