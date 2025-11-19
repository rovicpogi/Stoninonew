-- Database schema for assignments and submissions feature
-- Run this SQL in your Supabase SQL editor

-- Table for assignments and lessons uploaded by teachers
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('assignment', 'lesson')), -- 'assignment' or 'lesson'
  subject VARCHAR(100),
  grade_level VARCHAR(50),
  section VARCHAR(50),
  teacher_id UUID, -- Reference to teachers table
  teacher_email VARCHAR(255), -- For quick reference
  file_url TEXT, -- URL to file in Supabase Storage
  file_name VARCHAR(255), -- Original file name
  file_size BIGINT, -- File size in bytes
  due_date TIMESTAMP WITH TIME ZONE, -- Only for assignments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for student submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID, -- Reference to students table
  student_email VARCHAR(255), -- For quick reference
  file_url TEXT NOT NULL, -- URL to submitted file in Supabase Storage
  file_name VARCHAR(255) NOT NULL, -- Original file name
  file_size BIGINT, -- File size in bytes
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  grade DECIMAL(5,2), -- Grade out of 100
  feedback TEXT, -- Teacher feedback
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID -- Teacher who graded it
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(type);
CREATE INDEX IF NOT EXISTS idx_assignments_grade_section ON assignments(grade_level, section);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assignment_submissions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
-- Teachers can create and view their own assignments
CREATE POLICY "Teachers can create assignments" ON assignments
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth setup

CREATE POLICY "Teachers can view their assignments" ON assignments
  FOR SELECT USING (true); -- Adjust based on your auth setup

CREATE POLICY "Students can view assignments for their grade/section" ON assignments
  FOR SELECT USING (true); -- Adjust based on your auth setup

-- RLS Policies for submissions
-- Students can create submissions for assignments
CREATE POLICY "Students can create submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth setup

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON assignment_submissions
  FOR SELECT USING (true); -- Adjust based on your auth setup

-- Teachers can view all submissions for their assignments
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (true); -- Adjust based on your auth setup

-- Teachers can update submissions (grade/feedback)
CREATE POLICY "Teachers can update submissions" ON assignment_submissions
  FOR UPDATE USING (true); -- Adjust based on your auth setup

