import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// GET: Fetch assignments for a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherEmail = searchParams.get('teacher_email')
    const type = searchParams.get('type') // 'assignment' or 'lesson'

    if (!teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    
    let query = admin
      .from('assignments')
      .select('*')
      .eq('teacher_email', teacherEmail)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Assignments API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new assignment or lesson
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string // 'assignment' or 'lesson'
    const subject = formData.get('subject') as string
    const gradeLevel = formData.get('grade_level') as string
    const section = formData.get('section') as string
    const teacherEmail = formData.get('teacher_email') as string
    const teacherId = formData.get('teacher_id') as string
    const dueDate = formData.get('due_date') as string
    const file = formData.get('file') as File | null

    // Validate required fields
    if (!title || !type || !teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (title, type, teacher_email)' },
        { status: 400 }
      )
    }

    if (type !== 'assignment' && type !== 'lesson') {
      return NextResponse.json(
        { success: false, error: 'Type must be either "assignment" or "lesson"' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `assignments/${teacherEmail}/${fileName}`

    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await admin.storage
      .from('assignments')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL for the file
    const { data: urlData } = admin.storage
      .from('assignments')
      .getPublicUrl(filePath)

    // Insert assignment record
    const assignmentData: any = {
      title,
      description: description || null,
      type,
      subject: subject || null,
      grade_level: gradeLevel || null,
      section: section || null,
      teacher_email: teacherEmail,
      teacher_id: teacherId || null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    }

    const { data: assignment, error: insertError } = await admin
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating assignment:', insertError)
      // Try to delete uploaded file if assignment creation fails
      await admin.storage.from('assignments').remove([filePath])
      return NextResponse.json(
        { success: false, error: 'Failed to create assignment: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assignment,
      message: `${type === 'assignment' ? 'Assignment' : 'Lesson'} created successfully`
    })
  } catch (error: any) {
    console.error('Create assignment API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

