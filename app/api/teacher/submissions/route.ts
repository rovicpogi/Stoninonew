import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// GET: Fetch submissions for assignments created by a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherEmail = searchParams.get('teacher_email')
    const assignmentId = searchParams.get('assignment_id')

    if (!teacherEmail) {
      return NextResponse.json(
        { success: false, error: 'Teacher email is required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    
    // First get assignments by this teacher
    let assignmentsQuery = admin
      .from('assignments')
      .select('id')
      .eq('teacher_email', teacherEmail)

    if (assignmentId) {
      assignmentsQuery = assignmentsQuery.eq('id', assignmentId)
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery

    if (assignmentsError) {
      return NextResponse.json(
        { success: false, error: assignmentsError.message },
        { status: 500 }
      )
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const assignmentIds = assignments.map(a => a.id)

    // Get submissions for these assignments
    const { data: submissions, error: submissionsError } = await admin
      .from('assignment_submissions')
      .select('*, assignments(*)')
      .in('assignment_id', assignmentIds)
      .order('submitted_at', { ascending: false })

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
      return NextResponse.json(
        { success: false, error: submissionsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: submissions })
  } catch (error: any) {
    console.error('Teacher submissions API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Grade a submission
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { submission_id, grade, feedback, teacher_email } = body

    if (!submission_id || !teacher_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (submission_id, teacher_email)' },
        { status: 400 }
      )
    }

    if (grade !== null && grade !== undefined && (grade < 0 || grade > 100)) {
      return NextResponse.json(
        { success: false, error: 'Grade must be between 0 and 100' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Verify the submission exists and belongs to an assignment by this teacher
    const { data: submission, error: fetchError } = await admin
      .from('assignment_submissions')
      .select('*, assignments(*)')
      .eq('id', submission_id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    const assignment = submission.assignments as any
    if (assignment.teacher_email !== teacher_email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: This submission does not belong to your assignment' },
        { status: 403 }
      )
    }

    // Update submission with grade and feedback
    const updateData: any = {
      status: grade !== null && grade !== undefined ? 'graded' : 'submitted',
      graded_at: new Date().toISOString(),
    }

    if (grade !== null && grade !== undefined) {
      updateData.grade = grade
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback
    }

    const { data: updated, error: updateError } = await admin
      .from('assignment_submissions')
      .update(updateData)
      .eq('id', submission_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update submission: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Submission graded successfully'
    })
  } catch (error: any) {
    console.error('Grade submission API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

