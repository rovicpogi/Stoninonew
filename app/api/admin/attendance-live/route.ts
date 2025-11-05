import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const since = searchParams.get('since') // Optional: get records since this timestamp

    // Fetch recent attendance records
    // Join with students table to get student information
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        students (
          student_id,
          first_name,
          last_name,
          grade_level,
          section,
          photo_url,
          profile_picture,
          picture
        )
      `)
      .order('scan_time', { ascending: false })
      .limit(limit)

    // If 'since' parameter is provided, filter records after that time
    if (since) {
      query = query.gt('scan_time', since)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch attendance records',
        records: [],
      }, { status: 500 })
    }

    // Format the response
    const formattedRecords = (data || []).map((record: any) => ({
      id: record.id,
      studentId: record.student_id || record.students?.student_id,
      studentName: record.students 
        ? `${record.students.first_name || ''} ${record.students.last_name || ''}`.trim()
        : 'Unknown Student',
      gradeLevel: record.students?.grade_level || 'N/A',
      section: record.students?.section || 'N/A',
      scanTime: record.scan_time || record.created_at,
      status: record.status || 'Present',
      rfidCard: record.rfid_card || 'N/A',
      studentPhoto: record.students?.photo_url || record.students?.profile_picture || record.students?.picture || null,
    }))

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      count: formattedRecords.length,
    })
  } catch (error: any) {
    console.error('Attendance records API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error',
        records: [],
      },
      { status: 500 }
    )
  }
}

