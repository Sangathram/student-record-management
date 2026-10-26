# Student Record Management System 🎓
### Complete Java Full Stack Web Application (Lab Exam & Cloud Deployment Ready)

A full-stack student record management web application built with **Spring Boot 3 REST API** (supporting both local **H2** and production **PostgreSQL**) and a modern **React.js (Vite)** dashboard.

---

## 📌 Architecture Overview

```
 [ React.js Frontend (Vite) ]
         │ (HTTP / JSON via REST)
         ▼
 [ Spring Boot Web API (Port 8080 or $PORT) ]
         │
 [ Controller -> Service -> Repository ]
         │ (Spring Data JPA / Hibernate)
         ▼
 [ Database: Local H2 (File) OR Production PostgreSQL ]
```

---

## 🚀 Features

- **Add Student**: Enrolls a student with Roll Number, Full Name, Branch, and Email.
- **View All Students**: Displays a clean, responsive table with real-time record count badge.
- **Edit Student**: Pre-populates the form for editing and updates the record via `PUT`.
- **Delete Student**: Modal confirmation prevents accidental deletion and executes `DELETE`.
- **Form Validation**: Validates required fields, checks email syntax, and prevents duplicate roll numbers.
- **Status Banners**: Auto-dismissing success notifications and error alerts.
- **Auto-Refresh**: Automatically re-syncs the table with the backend after any mutation.
- **Configurable Environment**: API URL and database connections configurable via standard environment variables.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, JavaScript (ES Modules), CSS3.
- **Backend**: Java 17/21, Spring Boot 3.3.4, Spring Web, Spring Data JPA.
- **Database**:
  - Local Development: H2 embedded file database (`jdbc:h2:file:./data/studentdb`).
  - Production Deployment: PostgreSQL (`org.postgresql:postgresql` via profile).
- **Build Tools**: Maven 3.9+ & npm 11+.

---

## 📂 Project Structure

```
student-record-management/
├── backend/
│   ├── pom.xml                               # Maven project dependencies & PostgreSQL profile
│   └── src/main/
│       ├── java/com/exam/studentrecord/
│       │   ├── StudentRecordApplication.java  # Main entry point & initial sample seeder
│       │   ├── config/WebConfig.java          # Global dynamic CORS configuration
│       │   ├── entity/Student.java            # JPA entity mapping to students table
│       │   ├── repository/StudentRepository.java # Spring Data JPA repository
│       │   ├── service/StudentService.java       # Business logic & field validations
│       │   └── controller/StudentController.java # REST API endpoints
│       └── resources/
│           └── application.properties         # Server, JPA, and Database configuration
├── frontend/
│   ├── package.json                           # React & Vite dependencies
│   ├── vite.config.js                         # Vite dev server & API proxy
│   ├── index.html                             # Single page HTML entry
│   ├── .env.example                           # Sample frontend environment config
│   └── src/
│       ├── main.jsx                           # React root mounting
│       ├── App.jsx                            # Dashboard, Form, Table, CRUD logic
│       └── App.css                            # Clean responsive styling
├── .gitignore                                 # Git ignore rules for Maven & Node.js
└── README.md                                  # Complete documentation
```

---

## ⚡ Local Setup Instructions

### 1. Run the Backend (Terminal 1)
```powershell
cd backend
java -jar target/student-record-backend-1.0.0.jar
```
*(Or compile and run directly with `mvn spring-boot:run`)*
- Backend API: `http://localhost:8080/api/students`
- H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/studentdb`, User: `sa`, Password: blank)

### 2. Run the Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/students` | List all student records | `200 OK` |
| **GET** | `/api/students/{id}` | Retrieve a student record by ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/students` | Create a new student record | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/students/{id}` | Update existing student record | `200 OK` / `400 Bad Request` |
| **DELETE** | `/api/students/{id}` | Delete a student record by ID | `200 OK` / `404 Not Found` |

---

## ☁️ Online Deployment Guide

### A. Deploy Backend (e.g. Render / Railway)

1. Create a **Web Service** pointing to your GitHub repository root.
2. Set Root Directory: `backend`
3. Set Build Command:
   ```bash
   mvn clean package -DskipTests
   ```
4. Set Start Command:
   ```bash
   java -jar target/student-record-backend-1.0.0.jar
   ```
5. Environment Variables:
   - `PORT`: `8080`
   - `CORS_ALLOWED_ORIGINS`: Your deployed frontend URL (e.g. `https://your-frontend.vercel.app`)
   - For PostgreSQL (optional):
     - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:<port>/<db>`
     - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
     - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
     - `SPRING_DATASOURCE_DRIVER`: `org.postgresql.Driver`

---

### B. Deploy Frontend (e.g. Vercel / Render / Netlify)

1. Create a new frontend project connected to your GitHub repository.
2. Set Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`
