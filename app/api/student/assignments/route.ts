import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// GET: Fetch assignments for students
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gradeLevel = searchParams.get('grade_level')
    const section = searchParams.get('section')
    const type = searchParams.get('type') // 'assignment' or 'lesson'

    const admin = getSupabaseAdmin()
    
    let query = admin
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by grade level and section if provided
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel)
    }
    if (section) {
      query = query.eq('section', section)
    }
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
    console.error('Student assignments API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

