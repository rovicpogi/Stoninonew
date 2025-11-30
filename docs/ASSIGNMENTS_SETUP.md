# Assignments & Lessons Feature Setup Guide

This guide will help you set up the assignments and lessons feature that allows teachers to upload assignments/lessons and students to submit their work.

## Prerequisites

1. Supabase project with the database schema applied (see `ASSIGNMENTS_SCHEMA.sql`)
2. Supabase Storage buckets configured

## Step 1: Create Database Tables

Run the SQL script in `docs/ASSIGNMENTS_SCHEMA.sql` in your Supabase SQL Editor. This will create:
- `assignments` table - stores assignments and lessons uploaded by teachers
- `assignment_submissions` table - stores student submissions

## Step 2: Create Supabase Storage Buckets

You need to create two storage buckets in Supabase:

### Bucket 1: `assignments`
1. Go to your Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `assignments`
4. Make it **Public** (so students can download files)
5. Click "Create bucket"

### Bucket 2: `submissions`
1. Go to your Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `submissions`
4. Make it **Public** (so teachers can download student submissions)
5. Click "Create bucket"

## Step 3: Configure Storage Policies

After creating the buckets, you need to set up storage policies to control access:

### For `assignments` bucket:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assignments');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assignments');
```

### For `submissions` bucket:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');
```

**Note:** You may want to restrict read access to only authenticated users or specific roles. Adjust the policies based on your security requirements.

## Step 4: Test the Feature

1. **As a Teacher:**
   - Log in to the teacher portal
   - Navigate to the "Assignments" tab
   - Click "Upload Assignment/Lesson"
   - Fill in the form and upload a file
   - Verify the assignment appears in the list

2. **As a Student:**
   - Log in to the student portal
   - Navigate to the "Assignments" tab
   - View the uploaded assignments/lessons
   - Download the assignment file
   - Submit your completed assignment
   - Check submission status and grades

## Features

### Teacher Features:
- Upload assignments and lessons with file attachments
- Set due dates for assignments
- View all student submissions
- Grade submissions with feedback
- Download student submission files

### Student Features:
- View all assignments and lessons
- Download assignment/lesson files
- Submit completed assignments
- View submission status (submitted, graded, returned)
- View grades and teacher feedback
- Resubmit assignments if needed

## File Structure

- **API Routes:**
  - `/api/teacher/assignments` - Teacher assignment management
  - `/api/student/assignments` - Student assignment viewing
  - `/api/student/submissions` - Student submission management
  - `/api/teacher/submissions` - Teacher submission viewing and grading

- **UI Components:**
  - Teacher portal: `app/teacher/page.tsx` (Assignments tab)
  - Student portal: `app/student/page.tsx` (Assignments tab)

## Troubleshooting

### Files not uploading
- Check that storage buckets are created
- Verify storage policies are set correctly
- Check browser console for errors
- Ensure file size is within Supabase limits (default: 50MB)

### Files not accessible
- Verify buckets are set to "Public" or policies allow read access
- Check that file URLs are being generated correctly
- Verify RLS policies on the database tables

### Submissions not appearing
- Check that the assignment_id matches
- Verify student email is correct
- Check database for submission records

## Security Considerations

1. **File Size Limits:** Consider implementing file size limits in your API routes
2. **File Type Validation:** Add validation to restrict file types if needed
3. **Access Control:** Adjust RLS policies and storage policies based on your security requirements
4. **Virus Scanning:** Consider adding virus scanning for uploaded files in production

