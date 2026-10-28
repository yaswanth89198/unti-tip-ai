# UniTrack AI — AI-Based University Student Performance & Talent Analytics Management System

UniTrack AI is a full-stack university student information, academic performance, attendance, semester marks, talent portfolio, and machine-learning academic support platform.

---

## 1. Quick Start Guide (Windows & VS Code)

### Prerequisites
1. **Node.js**: v18.0+ or v20.0+ (`node -v`)
2. **Java JDK**: Eclipse Temurin or Oracle JDK 17+ (`java -version`)
3. **Apache Maven**: 3.8+ (`mvn -v`)
4. **MySQL Community Server**: 8.0+ & MySQL Workbench
5. **Python**: 3.10+ (`python --version`)

---

### Step 1: Database Setup (MySQL)
1. Open **MySQL Workbench** or command line:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema script:
   ```sql
   source /path/to/UniTrack-AI/database/schema.sql;
   ```
3. Execute the seed script:
   ```sql
   source /path/to/UniTrack-AI/database/seed.sql;
   ```

---

### Step 2: Spring Boot Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Build and launch:
   ```bash
   mvn clean package
   mvn spring-boot:run
   ```
   The API will listen at `http://localhost:8080/api`.

---

### Step 3: Python ML Analytics Service
1. Navigate to the ML directory:
   ```bash
   cd ml-service
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Train models and generate metrics:
   ```bash
   python train_model.py
   ```
5. Run the FastAPI microservice:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

---

### Step 4: React Frontend (Interactive Dashboard)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 2. Default Demo Logins

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Dean** | Prof. Rajesh Sharma | `rajesh.sharma@uni.edu` | `pass123` | University-wide stats, course & department comparisons, accreditation audits |
| **HOD** | Dr. Anita Sen | `anita.sen@uni.edu` | `pass123` | Department of Computer Science, marks moderation, attendance audits |
| **Coordinator** | Mr. Vikram Rao | `vikram.rao@uni.edu` | `pass123` | Student registrations, dataset importer, ticket resolution, audit log corrections |
| **Student** | Aarav Patel (240101) | `aarav.patel@uni.edu` | `pass123` | Personal profile, 8 semester grade cards, attendance tracker, tickets |

---

## 3. Machine Learning Models & Capabilities
- **Performance Estimator**: Random Forest Regressor predicting expected CGPA based on attendance percentage, internal marks, midterm scores, study hours, and backlogs.
- **Academic Support Needs Classifier**: Random Forest Classifier flagging students with high risk of academic probation or attendance shortage, triggering early remedial intervention.
- **Campus Placement Readiness**: Talent scoring engine assessing technical skills, projects, certifications, and internships to recommend personalized skill development pathways.

---

## 4. Datasets Provided
Located in `/datasets`:
1. `students.csv` — Student enrollments and metadata
2. `courses.csv` — Degree programs, credits, assessment rules
3. `subjects.csv` — Subject syllabi, credits, internal/external allocations
4. `semester_marks.csv` — Historical marks, backlogs, grades
5. `attendance.csv` — Subject-wise and semester attendance counts
6. `student_activities.csv` — Hackathons, workshops, internships, sports
7. `certificates.csv` — Verified professional credentials
8. `support_tickets.csv` — Academic grievance and helpdesk tickets
9. `student_performance_demo.csv` — ML training and evaluation benchmark
