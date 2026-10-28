# UniTrack AI — Architecture & Technical Specifications

## 1. System Topology
The system consists of three coordinated tiers:
1. **Frontend Presentation & Client Engine**: React 19 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide Icons.
2. **Backend API Service**: Spring Boot 3 + Spring Data JPA + Hibernate + Spring Security with JWT.
3. **AI / ML Microservice**: Python FastAPI + Scikit-Learn + Pandas + NumPy for predictive student scoring, dropout risk, and talent readiness.
4. **Relational Database**: MySQL 8.0 with InnoDB, foreign keys, cascading rules, and check constraints.

## 2. Security & RBAC Model
| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Dean** | University-wide | Comprehensive institutional metrics, cross-department benchmarking, accreditation audits |
| **HOD** | Department-specific | Department faculty oversight, marks moderation, attendance thresholds, student progress tracking |
| **Coordinator** | Academic Ops | Student enrollments, CSV dataset imports, attendance corrections, ticket dispatching |
| **Student** | Self only | 8-semester marks view, attendance radar, project portfolio, support ticketing |

## 3. Core Algorithms
- **SGPA**: $\text{SGPA} = \frac{\sum (\text{Credits}_i \times \text{GradePoints}_i)}{\sum \text{Credits}_i}$
- **CGPA**: $\text{CGPA} = \frac{\sum_{\text{all sem}} (\text{Credits}_i \times \text{GradePoints}_i)}{\sum_{\text{all sem}} \text{Credits}_i}$
- **Attendance Percentage**: $\text{Pct} = \left(\frac{\text{Classes Attended}}{\text{Classes Held}}\right) \times 100$
- **Academic Support Risk**: Random Forest Regression & Classification based on attendance rate, internal tests, past SGPA, backlogs, and study hours.
