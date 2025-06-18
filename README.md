# Job Importer System

A full-stack job ingestion and admin panel system built with **NestJS**, **MongoDB**, **Bull/Redis**, and **Next.js**. This project fetches job data from multiple XML APIs, parses it, queues it for background processing, stores it in MongoDB, and logs import history for visibility.

---

## 🚀 Tech Stack

### Backend:

* **NestJS** (Node.js framework)
* **MongoDB** with Mongoose ODM
* **Bull** (Redis-backed queue)
* **@nestjs/schedule** for cron jobs
* **class-validator** for DTO validation
* **xml2js** for XML parsing

### Frontend:

* **Next.js 13+ (App Router)**
* **React (with hooks)**
* **CSS modules** (or global CSS)
* **Axios** for HTTP

---

## 📦 Features

### ✅ Job Import Logic

* Scheduled every hour via `@Cron()`
* Parses XML feeds and converts to JSON
* Each job is pushed to a queue
* Worker inserts or updates jobs in MongoDB
* Stores import summary in an `import_logs` collection

### ✅ Queue Management

* Queue: `job-import-queue`
* Worker uses `@Processor()` to get registered for the above queue
* Configurable concurrency (e.g., 5 jobs at a time)
* Retry and backoff logic for fault tolerance

### ✅ Logging & Failure Handling

* Logs all successful, updated, and failed jobs
* Catches and logs parsing/network/DB errors
* Import logs can be queried via API or viewed in UI

### ✅ Admin Panel (Frontend)

* Import history list with:

  * Feed URL
  * Timestamp
  * Total/New/Updated/Failed counts
* Pagination
* Error states and loading states handled

---

## 🛠 Setup Instructions

👉 Copy `.env.example` to `.env` in both `/server` and `/client`, and fill in your local values:

cp server/.env.example server/.env
cp client/.env.example client/.env


### 1. Clone the repo

```bash
git clone https://github.com/yourname/job-importer-system.git
cd job-importer-system
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Create `.env` in `/server`

```env
MONGODB_URI=mongodb://localhost:27017/job_importer
REDIS_HOST=localhost
REDIS_PORT=6379
CONCURRENCY = '5'
ATTEMPTS = '3'
BACKOFF_DELAY = "5000"
```

### 4. Run MongoDB & Redis

```bash
sudo systemctl start mongod
redis-server
```

### 5. Run backend server

```bash
npm run start:dev
```

---

### 6. Install frontend dependencies

```bash
cd ../client
npm install
```

### 7. Run frontend

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 API Endpoints

### GET `/import-logs/getImportLogsData`

Query Parameters:

* `page`: number (default 1)
* `limit`: number (default 10)
* `feedUrl`: string (optional)

Response:

```json
{
  "success": true,
  "data": [...],
  "pagination": { page, limit, total, totalPages },
  "timestamp": "..."
}
```

---

## 📂 Project Structure

```
job-importer-system/
├── server/
│   ├── job.service.ts
│   ├── job.processor.ts
│   ├── import-log.schema.ts
│   └── ...
├── client/
│   ├── app/
│   │   └── page.tsx
│   └── styles.css
```

---

## 📘 Notes

* Job data structure is parsed from XML using `xml2js`
* `guid` field is used for job deduplication
* The system uses Bull’s retry & backoff to handle transient errors

---

## 🧑‍💻 Author

Built by Aditya Singh Bhati as part of the Full Stack Developer Task for Artha.

---
