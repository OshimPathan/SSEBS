-- Database schema for Seven Star English Boarding School ERP

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table handles authentication for all roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes Table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL, -- e.g., 'Class 10', '+2 Science'
  section VARCHAR(10),
  stream VARCHAR(100), -- For +2: 'Management', 'Computer Science', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subjects Table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  qualification VARCHAR(255),
  joined_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  roll_number INT,
  date_of_birth DATE,
  blood_group VARCHAR(5),
  address TEXT,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  parent_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to parent's user account
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers to Subjects Mapping (Many-to-Many)
CREATE TABLE teacher_subjects (
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY')),
  marked_by UUID REFERENCES users(id), -- Teacher or Admin who marked it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, date)
);

-- Exams Table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL, -- e.g., 'First Terminal Exam 2082'
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  exam_type VARCHAR(50), -- 'First Terminal', 'Second Terminal', 'Third Terminal', 'Final', 'Weekly Test', 'Unit Test', 'Mid-term', 'Pre-board'
  full_marks DECIMAL(5,2) DEFAULT 100,
  pass_marks DECIMAL(5,2) DEFAULT 40,
  published BOOLEAN DEFAULT FALSE, -- Visible on public exam schedule page
  results_published BOOLEAN DEFAULT FALSE, -- Results visible to students/public
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Results Table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2),
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  grade VARCHAR(5),
  remarks TEXT,
  verified BOOLEAN DEFAULT FALSE, -- Admin has verified this mark
  verified_by UUID REFERENCES users(id), -- Admin who verified
  verified_at TIMESTAMP WITH TIME ZONE, -- When verified
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_id, subject_id)
);

-- Exam Routines Table (subject-wise schedule)
CREATE TABLE exam_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE,
  start_time TIME,
  end_time TIME,
  room VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, subject_id)
);

-- Fees Table
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PAID', 'UNPAID', 'PARTIAL')),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notices Table
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50) CHECK (target_role IN ('ALL', 'TEACHER', 'STUDENT', 'PARENT', 'ADMIN')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admission Applications Table
CREATE TABLE admission_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),
  address TEXT NOT NULL,
  applied_for_class VARCHAR(100) NOT NULL,
  previous_school VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ========== MIGRATION: Add missing columns if upgrading ==========
-- Run these if tables already exist:
-- ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50);
-- ALTER TABLE exams ADD COLUMN IF NOT EXISTS full_marks DECIMAL(5,2) DEFAULT 100;
-- ALTER TABLE exams ADD COLUMN IF NOT EXISTS pass_marks DECIMAL(5,2) DEFAULT 40;
-- ALTER TABLE exams ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE;
-- ALTER TABLE exams ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT FALSE;
-- ALTER TABLE results ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
-- ALTER TABLE results ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
-- ALTER TABLE results ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
