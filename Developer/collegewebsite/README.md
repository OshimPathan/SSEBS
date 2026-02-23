# 🏫 Seven Star English Boarding School — ERP & Website

> A full-stack **School Enterprise Resource Planning (ERP)** system and public website for **Seven Star English Boarding School**, Devdaha, Rupandehi (Lumbini Province, Nepal). Quality English-medium education from **Nursery to +2**, NEB-affiliated programs in Management, Computer Science & Education. Established **2063 B.S.**

**🌐 Live URL:** [https://34yxw6n9.insforge.site](https://34yxw6n9.insforge.site)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [Features — Landing Page (Public)](#features--landing-page-public)
- [Features — Authentication](#features--authentication)
- [Features — Admin Dashboard](#features--admin-dashboard)
- [Features — Teacher Dashboard](#features--teacher-dashboard)
- [Features — Student / Parent Dashboard](#features--student--parent-dashboard)
- [API Layer (64+ Functions)](#api-layer-64-functions)
- [Routing & Access Control](#routing--access-control)
- [Design System](#design-system)
- [Storage & File Uploads](#storage--file-uploads)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Project Overview

This project is a **complete digital platform** for managing all aspects of a K-12 school with +2 programs. It combines:

1. **A public-facing website** — Landing page with 15 sections showcasing the school's identity, programs, facilities, gallery, testimonials, fee structure, admissions, and contact.
2. **A role-based ERP dashboard** — Full school management system supporting four user roles: **Admin**, **Teacher**, **Student**, and **Parent**, each with dedicated views and capabilities.
3. **A Backend-as-a-Service (BaaS) layer** — All data persistence, authentication, storage, and real-time capabilities powered by **InsForge** (PostgreSQL + Storage + SDK).

### What Problems It Solves

| Problem | Solution |
|---------|----------|
| Paper-based attendance tracking | Digital daily attendance with teacher-marked records, class-wise filtering |
| Manual exam result compilation | Centralized marks entry, grade computation, per-student result sheets |
| Fee collection opacity | Digital fee ledger with PAID/UNPAID/PARTIAL tracking, overdue detection |
| No online school presence | 15-section responsive landing page with SEO-friendly content |
| Disconnected parent communication | Parent portal with real-time access to child's results, fees, and notices |
| Admission paper forms | Online admission application with status tracking (PENDING/ACCEPTED/REJECTED) |
| Photo/document management | Cloud storage for student photos, certificates, and gallery images |
| Scattered notice boards | Digital notice system with role-based targeting (ALL/TEACHER/STUDENT/PARENT/ADMIN) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│            React 18 + Vite 5 + Tailwind CSS 3.4             │
│                                                             │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │  Landing  │  │  VTOP-Style │  │   Role-Based Dashboard │  │
│  │  (15 sec) │  │    Login    │  │  (Admin/Teacher/Stu/P) │  │
│  └──────────┘  └─────────────┘  └────────────────────────┘  │
│                        │                                     │
│               ┌────────┴────────┐                            │
│               │    api.js       │                            │
│               │  (64+ functions)│                            │
│               └────────┬────────┘                            │
└────────────────────────┼────────────────────────────────────┘
                         │  InsForge SDK
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    INSFORGE BaaS                             │
│                                                             │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL   │  │  Storage  │  │  Authentication      │  │
│  │  (13 tables)  │  │ (buckets) │  │  (JWT + bcrypt)      │  │
│  └──────────────┘  └───────────┘  └──────────────────────┘  │
│                                                             │
│  Base URL: https://34yxw6n9.us-east.insforge.app            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express.js — secondary)                │
│                                                             │
│  • Health check endpoint                                    │
│  • Route stubs for auth, admin, teacher, student            │
│  • PostgreSQL direct connection via pg                      │
│  • Helmet + CORS security                                  │
│  • NOT the primary data path (frontend uses InsForge SDK)   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

The **primary data path** is:

```
User → React Frontend → api.js → InsForge SDK → PostgreSQL (InsForge-hosted)
```

The Express backend exists as a **secondary/legacy API layer** with its own route structure. The frontend communicates exclusively through the InsForge SDK for all database queries, storage uploads, and authentication.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **UI Framework** | React | 18.2 | Component-based UI rendering |
| **Build Tool** | Vite | 5.2 | Fast HMR development & production builds |
| **Routing** | React Router | 6.22 | Client-side routing with protected routes |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS with custom design tokens |
| **Icons** | Lucide React | 0.368 | Consistent SVG icon system |
| **Charts** | Recharts | 2.12 | Dashboard data visualization (area, pie, bar) |
| **Auth Hashing** | bcryptjs | 3.0 | Client-side password hashing |
| **BaaS SDK** | @insforge/sdk | 1.1.5 | Database queries, storage, authentication |
| **Backend** | Express | 4.19 | Secondary API layer |
| **Security** | Helmet | 7.1 | HTTP security headers |
| **DB Driver** | pg | 8.11 | PostgreSQL connection (backend) |
| **JWT** | jsonwebtoken | 9.0 | Token-based auth (backend) |
| **Database** | PostgreSQL | — | Hosted on InsForge |
| **Hosting** | InsForge Sites | — | Frontend deployment + CDN |

---

## Folder Structure

```
collegewebsite/
├── README.md                          # This file
├── AGENTS.md                          # InsForge MCP agent instructions
│
├── backend/                           # Express.js backend (secondary)
│   ├── package.json
│   ├── schema.sql                     # Complete PostgreSQL schema (13 tables)
│   └── src/
│       ├── index.js                   # Express server entry (port 5000)
│       ├── db.js                      # PostgreSQL pool connection
│       ├── seed.js                    # Database seeding script
│       ├── controllers/
│       │   ├── adminController.js     # Admin CRUD operations
│       │   ├── authController.js      # Login/register handlers
│       │   ├── studentController.js   # Student data handlers
│       │   └── teacherController.js   # Teacher data handlers
│       ├── middleware/
│       │   └── auth.js                # JWT verification middleware
│       └── routes/
│           ├── adminRoutes.js         # /api/admin/*
│           ├── authRoutes.js          # /api/auth/*
│           ├── studentRoutes.js       # /api/student/*
│           └── teacherRoutes.js       # /api/teacher/*
│
└── frontend/                          # React + Vite frontend (primary)
    ├── package.json
    ├── index.html                     # Vite entry HTML
    ├── vite.config.js                 # Vite configuration
    ├── tailwind.config.js             # Custom colors, fonts
    ├── postcss.config.js              # PostCSS + Tailwind + Autoprefixer
    ├── public/                        # Static assets
    └── src/
        ├── main.jsx                   # React root + Router + AuthProvider
        ├── App.jsx                    # Route definitions + ProtectedRoute
        ├── api.js                     # 🔑 ALL API functions (64+, ~1100 lines)
        ├── index.css                  # Tailwind directives + custom utilities
        │
        ├── context/
        │   └── AuthContext.jsx        # Auth state (user, token, login, logout)
        │
        ├── layouts/
        │   └── DashboardLayout.jsx    # Sidebar + header + role-based nav
        │
        ├── components/
        │   └── landing/               # 15 landing page sections
        │       ├── Navbar.jsx         # Sticky nav with mobile drawer
        │       ├── Hero.jsx           # Image carousel (4 slides)
        │       ├── NoticeBoard.jsx    # Live notices from DB
        │       ├── About.jsx          # School history & mission
        │       ├── Programs.jsx       # NEB programs + subjects from DB
        │       ├── Stats.jsx          # Animated counter stats
        │       ├── Facilities.jsx     # Campus facilities grid
        │       ├── Gallery.jsx        # Photo gallery with lightbox
        │       ├── WhyChooseUs.jsx    # USP cards
        │       ├── Team.jsx           # Faculty showcase
        │       ├── Testimonials.jsx   # Student/parent reviews from DB
        │       ├── Contact.jsx        # Contact form + map
        │       └── Footer.jsx         # Site footer with links
        │
        └── pages/
            ├── Landing.jsx            # Assembles all 15 sections
            ├── Login.jsx              # VTOP-style login with spotlight
            └── dashboard/             # 15 dashboard pages
                ├── AdminDashboard.jsx # Role-aware stats + charts
                ├── AdminStudents.jsx  # Student CRUD + photo/cert upload
                ├── AdminTeachers.jsx  # Teacher CRUD + subject assignment
                ├── AdminClasses.jsx   # Class CRUD + subject management
                ├── AdminParents.jsx   # Parent account management
                ├── AdminNotices.jsx   # Notice CRUD (role-targeted)
                ├── AdminEvents.jsx    # Event CRUD
                ├── AdminGallery.jsx   # Gallery photo upload/manage
                ├── AdminPrograms.jsx  # Program subjects & syllabus
                ├── TeacherAttendance.jsx  # Daily attendance marking
                ├── TeacherMarks.jsx   # Exam marks entry
                ├── TeacherStudents.jsx # View assigned students (detailed)
                ├── StudentNotices.jsx # View notices
                ├── StudentResults.jsx # View exam results & grades
                └── StudentFees.jsx    # View fee details & status
```

---

## Database Schema

### Entity-Relationship Overview

```
users ──┬── teachers ──── teacher_subjects ──── subjects ──── classes
        │                                                       │
        ├── students ─────┬── attendance                        │
        │                 ├── results ── exams ─────────────────┘
        │                 └── fees
        │
        └── (created_by) ── notices
                             events
                             admission_applications
                             gallery_photos
                             program_subjects
                             site_settings
                             reviews
```

### Tables (13 Core + 4 Extended)

| Table | Columns | Purpose |
|-------|---------|---------|
| **users** | id, name, email, password_hash, role (ADMIN/TEACHER/STUDENT/PARENT), created_at, updated_at | Central authentication for all roles |
| **classes** | id, name, section, stream, created_at | Academic classes (Nursery → +2 Science/Mgmt/Education) |
| **subjects** | id, name, code, class_id (FK), created_at | Per-class subjects |
| **teachers** | id, user_id (FK→users), employee_id, phone, address, qualification, joined_date | Teacher profiles |
| **students** | id, user_id (FK→users), admission_number, class_id (FK), roll_number, date_of_birth, blood_group, address, parent_name, parent_phone, parent_email, parent_user_id (FK→users), photo_url, certificate_url, gender, nationality, religion, mother_name, mother_phone, emergency_contact, previous_school, previous_class | Student profiles with extended fields |
| **teacher_subjects** | teacher_id (FK), subject_id (FK) | Many-to-many teacher ↔ subject mapping |
| **attendance** | id, student_id (FK), class_id (FK), date, status (PRESENT/ABSENT/LATE/HALF_DAY), marked_by (FK→users) | Daily attendance records |
| **exams** | id, name, class_id (FK), exam_type, full_marks, pass_marks, start_date, end_date | Exam definitions (Unit Test/Mid-term/Final/Pre-board) |
| **results** | id, exam_id (FK), student_id (FK), subject_id (FK), marks_obtained, total_marks, grade, remarks | Per-student per-subject exam marks |
| **fees** | id, student_id (FK), amount, due_date, status (PAID/UNPAID/PARTIAL), amount_paid, description | Fee ledger |
| **notices** | id, title, content, target_role (ALL/TEACHER/STUDENT/PARENT/ADMIN), created_by (FK→users) | Role-targeted announcements |
| **events** | id, title, description, start_date, end_date, location | School calendar events |
| **admission_applications** | id, student_name, date_of_birth, parent_name, parent_phone, parent_email, address, applied_for_class, previous_school, status (PENDING/ACCEPTED/REJECTED) | Online admission pipeline |
| **gallery_photos** | id, title, description, image_url, category, created_at | School photo gallery (stored in InsForge Storage) |
| **program_subjects** | id, class_name, subject_name, credit_hours, description, syllabus_url | Academic program catalog |
| **site_settings** | id, key, value | Key-value site configuration |
| **reviews** | id, name, role, content, rating, approved, created_at | Student/parent testimonials with moderation |

### Key Relationships

- A **User** can be linked to exactly one **Teacher**, **Student**, or **Parent** profile
- A **Student** belongs to one **Class** and optionally links to a **Parent** user
- **Teachers** are assigned to **Subjects** via the `teacher_subjects` join table
- **Attendance** records are per-student per-date (unique constraint)
- **Results** are per-exam per-student per-subject (unique constraint)
- **Subjects** cascade-delete when their parent **Class** is deleted

---

## Features — Landing Page (Public)

The landing page consists of **15 responsive sections**, all data-driven from the database:

| # | Section | Description | Data Source |
|---|---------|-------------|-------------|
| 1 | **Navbar** | Sticky navigation with mobile hamburger drawer, smooth-scroll to sections | Static |
| 2 | **Hero** | Full-screen image carousel (4 slides) with school branding, CTA buttons | Static slides |
| 3 | **NoticeBoard** | Live scrolling notices with date badges | `notices` table via API |
| 4 | **About** | School history (est. 2063 B.S.), mission, vision, core values | Static |
| 5 | **Programs** | NEB-affiliated +2 programs with expandable subject lists | `program_subjects` table via API |
| 6 | **Stats** | Animated counters (students, teachers, years, programs) | Static |
| 7 | **Facilities** | Grid of campus facilities (labs, library, sports, etc.) | Static |
| 8 | **Gallery** | Photo grid with category filtering and lightbox zoom | `gallery_photos` table + InsForge Storage |
| 9 | **WhyChooseUs** | USP cards highlighting differentiators | Static |
| 10 | **Admissions** | Admission process steps and online application form | `admission_applications` table |
| 11 | **FeeStructure** | Fee breakdown by class level | Static |
| 12 | **Team** | Faculty cards with qualifications | Static |
| 13 | **Testimonials** | Student/parent reviews with star ratings | `reviews` table (approved only) |
| 14 | **Contact** | Contact form, school address, phone, email, embedded map | Static |
| 15 | **Footer** | Quick links, social media, copyright | Static |

---

## Features — Authentication

### VTOP-Style Login Page

- **Split-screen design**: Left panel with rotating spotlight of school notices (fetched from DB), right panel with login form
- **Role-based routing**: After login, users are redirected to `/dashboard` with role-appropriate content
- **Password security**: Client-side bcrypt hashing before comparison
- **Session persistence**: JWT token + user object stored in `localStorage`
- **Remember Me**: Functional checkbox for session persistence
- **4 User Roles**: Admin, Teacher, Student, Parent — each with unique dashboard experience

### Auth Flow

```
1. User enters email + password
2. api.js login() queries 'users' table by email
3. bcryptjs compares password with stored hash
4. On match: resolves role-specific data (teacher_id, student info, parent children)
5. Returns user object + mock JWT token
6. AuthContext stores in state + localStorage
7. ProtectedRoute checks user.role before rendering dashboard pages
```

---

## Features — Admin Dashboard

Admins have **full control** over all school data:

### Dashboard Home (`/dashboard`)
- **Stat Cards**: Total Students, Total Teachers, Today's Attendance %, Pending Fees — all from real DB queries
- **Weekly Attendance Chart**: Area chart showing last 7 days attendance trends (real data)
- **Fee Distribution Pie Chart**: Paid vs Pending vs Overdue breakdown (real counts)
- **Recent Notices**: Latest 5 notices from DB
- **Upcoming Events**: Next 5 events from DB
- **Recent Students**: Latest 5 enrolled students
- **Loading skeletons**: Pulse animation on stat cards while data loads
- **Empty states**: Graceful messaging when no data exists

### Student Management (`/dashboard/students`)
- Full CRUD: Create, Read, Update, Delete students
- **Photo upload**: Student photos stored in `student-documents` bucket (InsForge Storage)
- **Certificate upload**: Academic certificates stored alongside photos
- **Extended fields**: Gender, nationality, religion, blood group, mother info, emergency contact, previous school details
- **Class assignment**: Dropdown to assign students to classes
- **Parent linking**: Associate students with parent user accounts
- **Academic history**: Admission number, roll number, DOB tracking

### Teacher Management (`/dashboard/teachers`)
- Full CRUD for teacher profiles
- **Subject assignment**: Multi-select interface to assign teachers to subjects across classes
- Employee ID, qualification, phone, address, join date tracking

### Class & Subject Management (`/dashboard/classes`)
- Create/delete classes with name, section, stream
- Per-class subject management (add/remove subjects with codes)
- Cascading subject deletion when class is removed
- Average students per class stat with NaN protection

### Parent Management (`/dashboard/parents`)
- Create/delete parent accounts
- Link parents to student records

### Notice Management (`/dashboard/manage-notices`)
- CRUD for notices with role targeting (ALL/TEACHER/STUDENT/PARENT/ADMIN)
- Notices appear on login spotlight and student notice board

### Event Management (`/dashboard/manage-events`)
- CRUD for school events with title, description, dates, location

### Gallery Management (`/dashboard/manage-gallery`)
- Upload photos to InsForge `gallery` storage bucket
- Add title, description, category per photo
- Photos appear on landing page Gallery section

### Program & Syllabus Management (`/dashboard/manage-programs`)
- Manage academic program subjects
- Credit hours, descriptions, syllabus document links
- Data feeds into landing page Programs section

---

## Features — Teacher Dashboard

### Dashboard Home (`/dashboard`)
- **Stat Cards**: My Classes count, Total Students (in assigned classes), Today's Attendance %, My Subjects count
- All stats computed from teacher's actual assignments (not school-wide)

### Attendance (`/dashboard/attendance`)
- Select class → view enrolled students
- Mark attendance: PRESENT / ABSENT / LATE / HALF_DAY
- Date picker for historical records
- Bulk save attendance for entire class

### Exams & Marks (`/dashboard/exams`)
- Select class → select subject (filtered to teacher's assigned subjects only)
- Select exam → enter marks per student
- Grade auto-computation, remarks field
- Bulk save marks

### My Students (`/dashboard/my-students`)
- View all students in teacher's assigned classes
- Photo thumbnails in student table
- **Detailed student modal** with 3 tabs:
  - **Personal**: Gender, DOB, nationality, religion, blood group, emergency contact
  - **Guardian**: Father name/phone, mother name/phone, parent email
  - **Academic**: Admission number, roll number, class, previous school, certificate link

---

## Features — Student / Parent Dashboard

### Dashboard Home (`/dashboard`)
- **Stat Cards**: Class Name, Attendance %, GPA (computed from results grades), Pending Fees
- Parent accounts see their linked child's data

### Results (`/dashboard/results`)
- View exam-wise results with marks, grades, and remarks
- Subject-by-subject breakdown

### Fee Details (`/dashboard/fees`)
- View all fee records with amount, due date, payment status
- Track paid vs unpaid vs partial amounts

### Notices (`/dashboard/notices`)
- View role-appropriate notices (ALL + own role)
- Date-sorted, latest first

---

## API Layer (64+ Functions)

All API communication is centralized in `frontend/src/api.js` (~1,100 lines) using the InsForge SDK. No REST calls to the Express backend.

### Function Categories

<details>
<summary><strong>Authentication (1 function)</strong></summary>

| Function | Description |
|----------|-------------|
| `login(email, password)` | Authenticates user, resolves role-specific data (teacher_id, student info, parent children) |

</details>

<details>
<summary><strong>Students — CRUD (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getStudents()` | List all students with class join |
| `createStudent(data)` | Create user + student record |
| `updateStudent(id, data)` | Update student fields |
| `deleteStudent(id)` | Delete student + user record |

</details>

<details>
<summary><strong>Teachers — CRUD (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getTeachers()` | List all teachers with user join |
| `createTeacher(data)` | Create user + teacher record |
| `updateTeacher(id, data)` | Update teacher fields |
| `deleteTeacher(id)` | Delete teacher + user record |

</details>

<details>
<summary><strong>Parents — CRUD (3 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getParents()` | List all parent accounts |
| `createParent(data)` | Create parent user account |
| `deleteParent(id)` | Delete parent account |

</details>

<details>
<summary><strong>Classes (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getClasses()` | List classes with student count + subject list |
| `getAllClasses()` | Simple class list for dropdowns |
| `addClass(data)` | Create new class |
| `deleteClass(id)` | Delete class + cascade subjects |

</details>

<details>
<summary><strong>Notices — CRUD (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getNotices()` | List all notices |
| `createNotice(data)` | Create notice with role targeting |
| `updateNotice(id, data)` | Update notice |
| `deleteNotice(id)` | Delete notice |

</details>

<details>
<summary><strong>Events — CRUD (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getEvents()` | List all events |
| `createEvent(data)` | Create event |
| `updateEvent(id, data)` | Update event |
| `deleteEvent(id)` | Delete event |

</details>

<details>
<summary><strong>Exams (5 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getExams()` | List all exams |
| `getExamsByClass(classId)` | Exams for a specific class |
| `createExam(data)` | Create exam definition |
| `deleteExam(id)` | Delete exam |
| `publishResults(examId)` | Publish results for an exam |

</details>

<details>
<summary><strong>Gallery — with Storage (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getGalleryPhotos()` | List all gallery photos |
| `uploadGalleryPhoto(file, data)` | Upload to `gallery` bucket + insert record |
| `updateGalleryPhoto(id, data)` | Update photo metadata |
| `deleteGalleryPhoto(id)` | Delete photo + storage file |

</details>

<details>
<summary><strong>Programs / Subjects (4 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getProgramSubjects()` | List program catalog |
| `createProgramSubject(data)` | Add program subject |
| `updateProgramSubject(id, data)` | Update program subject |
| `deleteProgramSubject(id)` | Remove program subject |

</details>

<details>
<summary><strong>Dashboard Stats (3 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getDashboardStats()` | Admin: totals, weekly attendance, fee distribution, recent notices/events/students |
| `getTeacherDashboardStats(teacherId)` | Teacher: assigned classes/students/subjects count, attendance % |
| `getStudentDashboardStats(studentId)` | Student: class, attendance %, GPA, pending fees |

</details>

<details>
<summary><strong>Teacher Operations (10 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getTeacherClasses(teacherId)` | Classes assigned to teacher |
| `getStudentsByClass(classId)` | Students in a class |
| `getStudentsByClassDetailed(classId)` | Full student details with extended fields |
| `getAttendanceByDate(classId, date)` | Attendance records for a date |
| `saveAttendance(records)` | Bulk save attendance |
| `getSubjectsByClass(classId)` | All subjects in a class |
| `getTeacherSubjectsForClass(teacherId, classId)` | Only teacher's assigned subjects |
| `getTeacherSubjectsWithClasses(teacherId)` | All teacher subjects with class info |
| `getResultsForClassExam(classId, examId, subjectId)` | Results for marks entry |
| `saveBulkMarks(results)` | Bulk save exam marks |

</details>

<details>
<summary><strong>Student Academics (2 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getStudentResults(studentId)` | All exam results for a student |
| `getStudentFees(studentId)` | All fee records for a student |

</details>

<details>
<summary><strong>Reviews (5 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getApprovedReviews()` | Public: approved testimonials |
| `submitReview(data)` | Submit new review (pending approval) |
| `getAllReviews()` | Admin: all reviews |
| `approveReview(id)` | Admin: approve a review |
| `deleteReview(id)` | Admin: delete a review |

</details>

<details>
<summary><strong>File Uploads (2 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `uploadStudentPhoto(studentId, file)` | Upload to `student-documents` bucket, update `photo_url` |
| `uploadStudentCertificate(studentId, file)` | Upload to `student-documents` bucket, update `certificate_url` |

</details>

<details>
<summary><strong>Teacher Subject Assignment (3 functions)</strong></summary>

| Function | Description |
|----------|-------------|
| `getAllSubjects()` | All subjects with class info |
| `getTeacherAssignedSubjectIds(teacherId)` | Currently assigned subject IDs |
| `assignTeacherSubjects(teacherId, subjectIds)` | Bulk assign subjects to teacher |

</details>

---

## Routing & Access Control

### Route Map

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | Landing | Public | Full school website |
| `/login` | Login | Public | VTOP-style authentication |
| `/dashboard` | AdminDashboard | All authenticated | Role-aware dashboard home |
| `/dashboard/students` | AdminStudents | ADMIN | Student management |
| `/dashboard/teachers` | AdminTeachers | ADMIN | Teacher management |
| `/dashboard/classes` | AdminClasses | ADMIN | Class & subject management |
| `/dashboard/parents` | AdminParents | ADMIN | Parent management |
| `/dashboard/attendance` | TeacherAttendance | ADMIN, TEACHER | Attendance marking |
| `/dashboard/exams` | TeacherMarks | ADMIN, TEACHER | Marks entry |
| `/dashboard/my-students` | TeacherStudents | TEACHER | View assigned students |
| `/dashboard/notices` | StudentNotices | All authenticated | View notices |
| `/dashboard/manage-notices` | AdminNotices | ADMIN | Notice CRUD |
| `/dashboard/manage-events` | AdminEvents | ADMIN | Event CRUD |
| `/dashboard/manage-gallery` | AdminGallery | ADMIN | Gallery management |
| `/dashboard/manage-programs` | AdminPrograms | ADMIN | Program management |
| `/dashboard/results` | StudentResults | ADMIN, STUDENT, PARENT | View results |
| `/dashboard/fees` | StudentFees | ADMIN, STUDENT, PARENT | View fees |
| `*` | Redirect → `/` | — | Catch-all |

### ProtectedRoute Component

```jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
    return children;
};
```

### Sidebar Navigation (by Role)

| Role | Sidebar Links |
|------|---------------|
| **All** | Dashboard, Notices |
| **Admin** | + Students, Teachers, Classes & Subjects, Parents, Attendance, Exams & Marks, Manage Notices, Manage Events, Gallery Photos, Programs & Syllabus |
| **Teacher** | + Attendance, Exams & Marks, My Students |
| **Student / Parent** | + Results, Fee Details |

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#b20000` | Headers, buttons, active states |
| `primary-light` | `#d43333` | Hover states, lighter accents |
| `primary-dark` | `#8a0000` | Sidebar gradient, deep emphasis |
| `accent` | `#fead16` | CTAs, highlights, badges |
| `accent-light` | `#ffc94d` | Hover on accent elements |
| `accent-dark` | `#ec9f10` | Deep accent emphasis |
| `background` | `#f8f8f8` | Page backgrounds |

### Typography

| Token | Font | Fallbacks |
|-------|------|-----------|
| `font-sans` | Inter | system-ui, sans-serif |
| `font-serif` | Palatino Linotype | Palatino, Georgia, serif |

### Custom CSS Utilities

| Class | Purpose |
|-------|---------|
| `.section-title` | Consistent section heading style |
| `.section-subtitle` | Lighter subheading text |
| `.section-divider` | Centered decorative line |
| `.btn-primary` | Primary red button |
| `.btn-outline` | Outlined button variant |
| `.btn-accent` | Gold accent button |
| `.animate-fade-in-up` | Scroll entrance animation |
| `.animate-fade-in` | Simple fade entrance |

### Sidebar Gradient

```
background: linear-gradient(to bottom, primary-dark, #0a1045)
```

### Role Badge Colors

| Role | Color |
|------|-------|
| Admin | Blue |
| Teacher | Green |
| Student | Purple |
| Parent | Orange |

---

## Storage & File Uploads

### InsForge Storage Buckets

| Bucket | Access | Contents |
|--------|--------|----------|
| `gallery` | Public | School gallery photos (uploaded via AdminGallery) |
| `student-documents` | Public | Student profile photos + academic certificates |

### Upload Flow

```
1. Admin selects file in UI
2. api.js calls insforge.storage.from('bucket').uploadAuto(file)
3. InsForge stores file, returns public URL
4. URL is saved to corresponding DB record (photo_url, certificate_url, image_url)
5. UI renders image using the stored URL
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **InsForge account** with a provisioned backend (or local PostgreSQL for backend-only dev)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd collegewebsite

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional — frontend uses InsForge SDK directly)
cd ../backend
npm install
```

### Running the Frontend

```bash
cd frontend
npm run dev
# → Opens at http://localhost:5173
```

### Running the Backend (Optional)

```bash
cd backend
npm run dev
# → Starts on http://localhost:5000
```

### Building for Production

```bash
cd frontend
npm run build
# → Output in frontend/dist/
```

---

## Environment Variables

### Frontend

The InsForge SDK configuration is hardcoded in `api.js`:

```javascript
const insforge = createClient({
    baseUrl: 'https://34yxw6n9.us-east.insforge.app',
    anonKey: '<your-anon-key>'
});
```

> **Note**: For production, move these to `.env` files:
> ```
> VITE_INSFORGE_URL=https://34yxw6n9.us-east.insforge.app
> VITE_INSFORGE_ANON_KEY=your-key-here
> ```

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/seven_star_school` | PostgreSQL connection string |
| `JWT_SECRET` | (required) | Secret for JWT token signing |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## Deployment

### Current Deployment

- **Platform**: InsForge Sites
- **Live URL**: [https://34yxw6n9.insforge.site](https://34yxw6n9.insforge.site)
- **Method**: Source deployment (not pre-built)

### Deployment Configuration

```json
{
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "outputDirectory": "dist"
}
```

### Deploying Updates

Deploy from the **source directory** (`frontend/`), not the pre-built `dist/` folder:

```
Source Directory: /path/to/collegewebsite/frontend
Build Command:   npm run build
Install Command: npm install
Output Dir:      dist
```

> **⚠️ Important**: Deploying a pre-built `dist/` folder directly causes deployment failures. Always deploy from the source directory with build commands configured.

---

## Future Roadmap

### 🔴 Phase 1 — Critical Enhancements (High Priority)

#### 1.1 Server-Side Password Hashing
- **Current**: Passwords are hashed client-side using `bcryptjs` — the hash is stored directly in DB, but comparison happens in the browser
- **Target**: Move password hashing to an InsForge Edge Function or the Express backend
- **Why**: Client-side hashing means the hash itself becomes the password equivalent; intercepting it grants access
- **Implementation**: Create an InsForge serverless function for `/auth/login` and `/auth/register` endpoints that handle bcrypt server-side

#### 1.2 Proper JWT Authentication
- **Current**: JWT tokens are mock-generated client-side; not verified by any server
- **Target**: Implement proper JWT signing on the server (InsForge Edge Function or Express backend), verify tokens on protected API calls
- **Implementation**: 
  - Sign JWT with `HS256` or `RS256` in server function
  - Add InsForge Row Level Security (RLS) policies tied to JWT claims
  - Verify token on every SDK call via InsForge auth integration

#### 1.3 Environment Variable Externalization
- **Current**: InsForge base URL and anon key are hardcoded in `api.js`
- **Target**: Move to Vite environment variables (`VITE_INSFORGE_URL`, `VITE_INSFORGE_ANON_KEY`) loaded from `.env`
- **Implementation**: Replace hardcoded values with `import.meta.env.VITE_*`

#### 1.4 Row Level Security (RLS)
- **Current**: All database queries use the anon key with no row-level restrictions
- **Target**: Implement PostgreSQL RLS policies so:
  - Students can only read their own results/fees/attendance
  - Teachers can only modify attendance/marks for their assigned classes
  - Parents can only view their linked children's data
  - Only admins can INSERT/UPDATE/DELETE on management tables

---

### 🟡 Phase 2 — Feature Completions (Medium Priority)

#### 2.1 Exam Management Admin Page
- **Status**: API functions exist (`createExam`, `deleteExam`, `publishResults`) but no admin UI page
- **Target**: Build `/dashboard/manage-exams` with:
  - Create exam with name, class, exam type (Unit Test/Mid-term/Final/Pre-board), full marks, pass marks, date range
  - View/edit/delete exams
  - Publish results per exam
  - Exam schedule calendar view

#### 2.2 Review Moderation Admin Page
- **Status**: API functions exist (`getAllReviews`, `approveReview`, `deleteReview`) but no admin UI
- **Target**: Build `/dashboard/manage-reviews` with:
  - List all submitted reviews (pending + approved)
  - Approve/reject individual reviews
  - Delete inappropriate reviews
  - Star rating display, submission date, reviewer info

#### 2.3 Admission Application Management
- **Status**: Admission form exists on landing page, applications stored in `admission_applications` table
- **Target**: Build `/dashboard/admissions` for admin with:
  - List all pending/accepted/rejected applications
  - View full application details
  - Accept → auto-create student account
  - Reject with reason
  - Export applications as CSV/PDF

#### 2.4 Report Card / Transcript Generation
- **Target**: Generate printable PDF report cards per student per exam
- **Implementation**:
  - Use `html2pdf.js` or `jspdf` for client-side PDF generation
  - Include school letterhead, student photo, subject-wise marks, grade summary, teacher remarks, principal signature placeholder
  - Batch generation for entire class

#### 2.5 Fee Payment Integration
- **Current**: Fee tracking is read-only (no payment processing)
- **Target**: Integrate payment gateway (Khalti / eSewa for Nepal)
- **Implementation**:
  - Add payment initiation from StudentFees page
  - Webhook handler (InsForge Edge Function) for payment confirmation
  - Auto-update fee status from UNPAID → PAID on successful payment
  - Payment receipt generation

#### 2.6 SMS / Email Notifications
- **Target**: Automated notifications for:
  - Fee due reminders (3 days before, on due date, overdue)
  - Attendance alerts (child absent notification to parent)
  - Exam results published
  - New notice posted
- **Implementation**: InsForge Edge Functions triggering email (Resend/SendGrid) or SMS (Sparrow SMS for Nepal)

---

### 🟢 Phase 3 — Advanced Features (Lower Priority)

#### 3.1 Timetable Management
- **Target**: Weekly class timetable builder with:
  - Drag-and-drop timetable creation
  - Period ↔ subject ↔ teacher mapping
  - Clash detection (same teacher assigned to two classes simultaneously)
  - Student view of their weekly schedule
  - Teacher view of their teaching schedule

#### 3.2 Library Management Module
- **New tables**: `books`, `book_issues`, `book_returns`
- **Features**: Book catalog, issue/return tracking, overdue alerts, student borrowing history

#### 3.3 Transport Management Module
- **New tables**: `buses`, `routes`, `bus_assignments`
- **Features**: Bus route management, student bus assignment, route fee tracking, driver details

#### 3.4 Hostel Management Module
- **New tables**: `hostels`, `rooms`, `room_assignments`
- **Features**: Room allocation, hostel fee tracking, roommate management

#### 3.5 Real-Time Features (InsForge WebSocket)
- **Target**: Leverage InsForge real-time pub/sub for:
  - Live attendance updates (teacher marks → parent sees immediately)
  - Real-time notice push notifications
  - Live chat between teachers and parents
  - Dashboard stat auto-refresh

#### 3.6 Analytics & Reporting Dashboard
- **Target**: Advanced analytics with:
  - Student performance trends over multiple exams (line charts)
  - Class-wise attendance heatmaps
  - Fee collection trends (monthly/quarterly/yearly)
  - Teacher workload analysis
  - Student demographic breakdowns
  - Exportable reports (PDF, Excel)

#### 3.7 Multi-Language Support (i18n)
- **Target**: Support for:
  - English (default)
  - Nepali (नेपाली) — primary local language
- **Implementation**: `react-i18next` with JSON translation files

#### 3.8 Mobile App (React Native)
- **Target**: Native mobile app for:
  - Parent app: View child attendance, results, fees, notices
  - Teacher app: Mark attendance, enter marks on mobile
  - Push notifications via Firebase Cloud Messaging
- **Implementation**: Reuse `api.js` functions with React Native UI

#### 3.9 AI-Powered Features
- **Target**: Leverage InsForge AI integration for:
  - Automated report card remarks based on marks/attendance
  - Student performance prediction (at-risk detection)
  - Chatbot for common parent queries (fees, schedule, etc.)
  - Smart timetable generation avoiding conflicts

#### 3.10 Bulk Data Operations
- **Target**: 
  - CSV import for student enrollment (bulk admission)
  - CSV import for fee records
  - Excel export for attendance sheets, mark sheets, fee reports
  - Bulk result publishing across multiple exams

---

### 🔵 Phase 4 — Infrastructure & DevOps

#### 4.1 Testing Suite
- **Unit Tests**: Vitest for api.js functions (mock InsForge SDK)
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Playwright for full user flows (login → dashboard → operations)
- **Coverage Target**: 80%+ on critical paths

#### 4.2 CI/CD Pipeline
- **Target**: GitHub Actions workflow for:
  - Lint (ESLint) on PR
  - Type checking (optional TypeScript migration)
  - Build verification
  - Auto-deploy to InsForge Sites on `main` merge

#### 4.3 TypeScript Migration
- **Current**: Pure JavaScript (`.js`, `.jsx`)
- **Target**: Gradual migration to TypeScript (`.ts`, `.tsx`)
- **Priority files**: `api.js` → `api.ts` (type-safe API layer), `AuthContext` → typed context

#### 4.4 Error Monitoring
- **Target**: Integrate Sentry for:
  - Frontend error tracking
  - API call failure monitoring
  - Performance monitoring (LCP, FID, CLS)

#### 4.5 SEO & Performance
- **Target**:
  - Add meta tags, Open Graph, Twitter cards
  - Implement lazy loading for dashboard pages (`React.lazy` + `Suspense`)
  - Image optimization (WebP conversion, responsive sizes)
  - Lighthouse score ≥ 90 on all categories

---

## Known Limitations

| Area | Limitation | Impact | Workaround |
|------|-----------|--------|------------|
| **Authentication** | Password hashing is client-side (bcryptjs) | Hash becomes password-equivalent; insecure for production | Move to server-side Edge Function |
| **Authorization** | No Row Level Security (RLS) on database | Any authenticated user could potentially query any data via SDK | Implement PostgreSQL RLS policies |
| **JWT** | Tokens are mock-generated client-side | No server-side verification or expiration | Implement proper server-signed JWTs |
| **Anon Key** | Hardcoded in source code | Exposed in client bundle (by design for BaaS, but needs RLS) | Add RLS policies to restrict access |
| **Backend** | Express backend is not actively used | Frontend bypasses it entirely | Either migrate to it or remove |
| **Payments** | Fee tracking is read-only | No actual payment processing | Integrate Khalti/eSewa gateway |
| **Notifications** | No email/SMS notifications | Users must log in to check updates | Add notification service |
| **File Validation** | No server-side file type/size validation | Malicious files could be uploaded | Add validation in Edge Function |
| **Search** | No full-text search on student/teacher lists | Difficult to find records in large datasets | Implement search with InsForge queries |
| **Pagination** | Most lists load all records at once | Performance degrades with large datasets | Implement cursor-based pagination |
| **Offline** | No offline support | App unusable without internet | Consider service workers / PWA |

---

## License

This project is proprietary software developed for **Seven Star English Boarding School**, Devdaha, Rupandehi, Nepal.

All rights reserved. Unauthorized copying, modification, or distribution is prohibited.

---

<div align="center">

**Built with ❤️ for Seven Star English Boarding School**

*Devdaha, Rupandehi, Lumbini Province, Nepal*

*Established 2063 B.S.*

</div>
