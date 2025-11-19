import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// GET: Fetch submissions for a student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentEmail = searchParams.get('student_email')
    const assignmentId = searchParams.get('assignment_id')

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    
    let query = admin
      .from('assignment_submissions')
      .select('*, assignments(*)')
      .eq('student_email', studentEmail)
      .order('submitted_at', { ascending: false })

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Submissions API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Submit an assignment
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const assignmentId = formData.get('assignment_id') as string
    const studentEmail = formData.get('student_email') as string
    const studentId = formData.get('student_id') as string
    const file = formData.get('file') as File | null

    // Validate required fields
    if (!assignmentId || !studentEmail || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (assignment_id, student_email, file)' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Check if assignment exists
    const { data: assignment, error: assignmentError } = await admin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check if already submitted (optional: allow resubmission)
    const { data: existingSubmission } = await admin
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_email', studentEmail)
      .single()

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `submissions/${studentEmail}/${assignmentId}/${fileName}`

    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await admin.storage
      .from('submissions')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: existingSubmission ? true : false // Allow overwrite if resubmitting
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
      .from('submissions')
      .getPublicUrl(filePath)

    // Insert or update submission record
    const submissionData: any = {
      assignment_id: assignmentId,
      student_email: studentEmail,
      student_id: studentId || null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      status: 'submitted',
    }

    let submission
    if (existingSubmission) {
      // Update existing submission
      const { data: updated, error: updateError } = await admin
        .from('assignment_submissions')
        .update(submissionData)
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (updateError) {
        await admin.storage.from('submissions').remove([filePath])
        return NextResponse.json(
          { success: false, error: 'Failed to update submission: ' + updateError.message },
          { status: 500 }
        )
      }
      submission = updated
    } else {
      // Create new submission
      const { data: created, error: insertError } = await admin
        .from('assignment_submissions')
        .insert([submissionData])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating submission:', insertError)
        await admin.storage.from('submissions').remove([filePath])
        return NextResponse.json(
          { success: false, error: 'Failed to create submission: ' + insertError.message },
          { status: 500 }
        )
      }
      submission = created
    }

    return NextResponse.json({
      success: true,
      data: submission,
      message: existingSubmission ? 'Submission updated successfully' : 'Assignment submitted successfully'
    })
  } catch (error: any) {
    console.error('Submit assignment API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

