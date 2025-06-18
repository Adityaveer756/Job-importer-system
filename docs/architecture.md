# Architecture Overview – Job Importer System

## 🧠 Objective
A full-stack system that periodically fetches job listings from external XML feeds, processes them using a background queue, stores them in MongoDB, and exposes a UI for tracking import history.

---

## 🔧 Tech Stack

| Layer       | Technology           |
|-------------|----------------------|
| Backend     | NestJS + MongoDB + Redis (Bull) |
| Queue       | Bull (Redis-backed)  |
| Scheduler   | @nestjs/schedule      |
| Parser      | xml2js               |
| Frontend    | Next.js (App Router) |

---

## ⚙️ System Components

### 1. **JobService (NestJS)**
- Uses `@Cron('0 * * * *')` to run every hour
- Fetches job listings from multiple XML APIs
- Parses XML to JSON using `xml2js`
- Adds each job to `job-import-queue` using Bull

### 2. **JobProcessor (Worker)**
- Runs in background via `@Processor('job-import-queue')`
- For each job:
  - Checks if job exists via `guid`
  - If yes → update job
  - If no → insert new job
  - Logs result to `import_logs` collection
- Supports concurrency, retry, and backoff

### 3. **Import Log Schema**
- Stores metadata for each feed run:
  - `feedUrl`, `timestamp`
  - `totalFetched`, `newJobs`, `updatedJobs`, `failedJobs[]`

### 4. **API Layer**
- `/import-logs/getImportLogsData` returns logs with pagination 
- DTOs ensure validation and type safety

### 5. **Frontend (Next.js)**
- Fetches logs from backend
- Displays log cards with counts and timestamp
- Supports:
  - Pagination
  - Error/Loading states

---

## 🔄 Data Flow Diagram

```text
Cron Job (Hourly)
   │
   ▼
Fetch + Parse XML Feeds
   │
   ▼
Queue Each Job (Bull + Redis)
   │
   ▼
JobProcessor (Worker)
   ├─> Upsert Job (MongoDB)
   └─> Update Import Log (MongoDB)
