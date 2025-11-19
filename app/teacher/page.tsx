"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  LogOut,
  Users,
  Calendar,
  FileText,
  Plus,
  Edit,
  Save,
  Bell,
  Clock,
  Home,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function TeacherPortal() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [journalEntry, setJournalEntry] = useState({
    date: "",
    subject: "",
    topic: "",
    activities: "",
    notes: "",
  })
  const [showAddJournal, setShowAddJournal] = useState(false)
  const [teacherData, setTeacherData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    classesToday: 0,
    pendingGrades: 0,
    journalEntries: 0,
    todaySchedule: [] as any[],
    announcements: [] as any[],
  })
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" })
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "assignment",
    subject: "",
    grade_level: "",
    section: "",
    due_date: "",
    file: null as File | null,
  })

  useEffect(() => {
    // Load teacher data from localStorage
    const user = localStorage.getItem("teacher")
    if (user) {
      setTeacherData(JSON.parse(user))
    }
    
    // Load journal entries from localStorage
    const savedEntries = localStorage.getItem(`journal_entries_${user ? JSON.parse(user).email : 'default'}`)
    if (savedEntries) {
      const entries = JSON.parse(savedEntries)
      setJournalEntries(entries)
      setDashboardStats(prev => ({ ...prev, journalEntries: entries.length }))
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Fetch dashboard stats when component loads and teacherData is available
    if (teacherData && activeTab === "dashboard") {
      const fetchStats = async () => {
        try {
          const response = await fetch("/api/teacher/stats")
          const result = await response.json()
          if (result.success) {
            setDashboardStats(result.data)
          }
        } catch (error) {
          console.error("Failed to fetch teacher stats:", error)
        }
      }
      fetchStats()
    }

    // Fetch assignments when on assignments tab
    if (teacherData && activeTab === "assignments") {
      fetchAssignments()
      fetchSubmissions()
    }
  }, [teacherData, activeTab])

  const fetchAssignments = async () => {
    if (!teacherData?.email) return
    try {
      const response = await fetch(`/api/teacher/assignments?teacher_email=${encodeURIComponent(teacherData.email)}`)
      const result = await response.json()
      if (result.success) {
        setAssignments(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    }
  }

  const fetchSubmissions = async () => {
    if (!teacherData?.email) return
    try {
      const response = await fetch(`/api/teacher/submissions?teacher_email=${encodeURIComponent(teacherData.email)}`)
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    }
  }

  const handleUploadAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherData?.email || !uploadForm.file) {
      alert("Please fill in all required fields and select a file")
      return
    }

    const formData = new FormData()
    formData.append("title", uploadForm.title)
    formData.append("description", uploadForm.description)
    formData.append("type", uploadForm.type)
    formData.append("subject", uploadForm.subject)
    formData.append("grade_level", uploadForm.grade_level)
    formData.append("section", uploadForm.section)
    formData.append("teacher_email", teacherData.email)
    formData.append("teacher_id", teacherData.id || "")
    if (uploadForm.due_date) {
      formData.append("due_date", uploadForm.due_date)
    }
    formData.append("file", uploadForm.file)

    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert(result.message || "Upload successful!")
        setShowUploadDialog(false)
        setUploadForm({
          title: "",
          description: "",
          type: "assignment",
          subject: "",
          grade_level: "",
          section: "",
          due_date: "",
          file: null,
        })
        fetchAssignments()
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload assignment")
    }
  }

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission || !teacherData?.email) return

    const response = await fetch("/api/teacher/submissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission_id: selectedSubmission.id,
        grade: gradeForm.grade ? parseFloat(gradeForm.grade) : null,
        feedback: gradeForm.feedback,
        teacher_email: teacherData.email,
      }),
    })

    const result = await response.json()
    if (result.success) {
      alert("Submission graded successfully!")
      setShowGradeDialog(false)
      setSelectedSubmission(null)
      setGradeForm({ grade: "", feedback: "" })
      fetchSubmissions()
    } else {
      alert("Error: " + result.error)
    }
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("teacher")
      window.location.href = "/"
    }
  }

  const handleGradeUpdate = (studentId: number, subject: string, newGrade: number) => {
    console.log(`Updating ${subject} grade for student ${studentId} to ${newGrade}`)
  }

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newEntry = {
      id: Date.now(),
      ...journalEntry,
      createdAt: new Date().toISOString(),
    }
    
    const updatedEntries = [newEntry, ...journalEntries]
    setJournalEntries(updatedEntries)
    
    // Save to localStorage
    const user = localStorage.getItem("teacher")
    const email = user ? JSON.parse(user).email : 'default'
    localStorage.setItem(`journal_entries_${email}`, JSON.stringify(updatedEntries))
    
    // Update dashboard stats
    setDashboardStats(prev => ({ ...prev, journalEntries: updatedEntries.length }))
    
    setShowAddJournal(false)
    setJournalEntry({ date: "", subject: "", topic: "", activities: "", notes: "" })
  }
  
  const handleDeleteJournal = (id: number) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      const updatedEntries = journalEntries.filter(entry => entry.id !== id)
      setJournalEntries(updatedEntries)
      
      // Save to localStorage
      const user = localStorage.getItem("teacher")
      const email = user ? JSON.parse(user).email : 'default'
      localStorage.setItem(`journal_entries_${email}`, JSON.stringify(updatedEntries))
      
      // Update dashboard stats
      setDashboardStats(prev => ({ ...prev, journalEntries: updatedEntries.length }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the Teacher Portal</p>
          <Link href="/">
            <Button className="bg-red-800 hover:bg-red-700">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-red-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Image
                src="/logo.png"
                alt="Sto Niño de Praga Academy Logo"
                width={60}
                height={60}
                className="rounded-full hidden sm:block"
              />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-red-800">Teacher Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Sto Niño de Praga Academy</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button variant="outline" className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white text-xs sm:text-sm">
                  <Home className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
              <div className="text-right hidden sm:block">
                <p className="font-medium text-red-800 text-sm">
                  {teacherData?.first_name} {teacherData?.last_name}
                </p>
                <p className="text-xs text-gray-600">
                  {teacherData?.subject || teacherData?.department || "Teacher"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-4 sm:mb-8 gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <GraduationCap className="w-4 h-4 mr-2" />
              Manage Grades
            </TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Teaching Journal
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{dashboardStats.totalStudents}</div>
                  <p className="text-xs text-gray-600">Across all classes</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Classes Today</CardTitle>
                  <Calendar className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{dashboardStats.classesToday}</div>
                  <p className="text-xs text-gray-600">{teacherData?.subject || "Scheduled classes"}</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Pending Grades</CardTitle>
                  <FileText className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{dashboardStats.pendingGrades}</div>
                  <p className="text-xs text-gray-600">Need to be updated</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Journal Entries</CardTitle>
                  <BookOpen className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{dashboardStats.journalEntries}</div>
                  <p className="text-xs text-gray-600">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats.todaySchedule.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardStats.todaySchedule.map((schedule: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="font-medium">{schedule.title}</p>
                            <p className="text-sm text-gray-600">{schedule.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No schedule available for today
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats.announcements.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardStats.announcements.map((announcement: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Bell className="w-4 h-4 text-red-600 mt-1" />
                          <div>
                            <p className="font-medium">{announcement.title}</p>
                            <p className="text-sm text-gray-600">{announcement.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No announcements available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grades Management Tab */}
          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Student Grades Management</CardTitle>
                <CardDescription>View and update student grades for your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select defaultValue="grade7a">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade7a">Grade 7-A</SelectItem>
                      <SelectItem value="grade7b">Grade 7-B</SelectItem>
                      <SelectItem value="grade8a">Grade 8-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No student records found. Data will be loaded from database.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-red-800">Assignments & Lessons</CardTitle>
                  <CardDescription>Upload assignments and lessons for your students</CardDescription>
                </div>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-800 hover:bg-red-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Assignment/Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Upload Assignment or Lesson</DialogTitle>
                      <DialogDescription>Upload a file for your students to view and complete</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadAssignment} className="space-y-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={uploadForm.type}
                          onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="lesson">Lesson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                          placeholder="e.g., Math Homework Chapter 5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                          placeholder="Instructions or additional information"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={uploadForm.subject}
                            onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                            placeholder="e.g., Mathematics"
                          />
                        </div>
                        <div>
                          <Label htmlFor="grade_level">Grade Level</Label>
                          <Input
                            id="grade_level"
                            value={uploadForm.grade_level}
                            onChange={(e) => setUploadForm({ ...uploadForm, grade_level: e.target.value })}
                            placeholder="e.g., Grade 7"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={uploadForm.section}
                            onChange={(e) => setUploadForm({ ...uploadForm, section: e.target.value })}
                            placeholder="e.g., Section A"
                          />
                        </div>
                        {uploadForm.type === "assignment" && (
                          <div>
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                              id="due_date"
                              type="datetime-local"
                              value={uploadForm.due_date}
                              onChange={(e) => setUploadForm({ ...uploadForm, due_date: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="file">File *</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                          required
                        />
                        {uploadForm.file && (
                          <p className="text-sm text-gray-600 mt-1">Selected: {uploadForm.file.name}</p>
                        )}
                      </div>
                      <Button type="submit" className="w-full bg-red-800 hover:bg-red-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <Card key={assignment.id} className="border-l-4 border-l-red-800">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                <Badge variant={assignment.type === "assignment" ? "default" : "secondary"}>
                                  {assignment.type}
                                </Badge>
                              </div>
                              {assignment.description && (
                                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {assignment.subject && <span>Subject: {assignment.subject}</span>}
                                {assignment.grade_level && <span>Grade: {assignment.grade_level}</span>}
                                {assignment.section && <span>Section: {assignment.section}</span>}
                                {assignment.due_date && (
                                  <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                                )}
                                <span>Uploaded: {new Date(assignment.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-3">
                                <a
                                  href={assignment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-800 hover:underline flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  {assignment.file_name}
                                </a>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No assignments or lessons uploaded yet. Click "Upload Assignment/Lesson" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submissions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Student Submissions</CardTitle>
                <CardDescription>View and grade student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission: any) => {
                        const assignment = submission.assignments || {}
                        return (
                          <TableRow key={submission.id}>
                            <TableCell>{submission.student_email}</TableCell>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>
                              <a
                                href={submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-800 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                {submission.file_name}
                              </a>
                            </TableCell>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  submission.status === "graded"
                                    ? "default"
                                    : submission.status === "returned"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.grade !== null ? `${submission.grade}/100` : "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission)
                                  setGradeForm({
                                    grade: submission.grade?.toString() || "",
                                    feedback: submission.feedback || "",
                                  })
                                  setShowGradeDialog(true)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Grade
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No submissions yet. Students will appear here once they submit their assignments.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grade Dialog */}
            <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grade Submission</DialogTitle>
                  <DialogDescription>
                    Provide a grade and feedback for this submission
                  </DialogDescription>
                </DialogHeader>
                {selectedSubmission && (
                  <form onSubmit={handleGradeSubmission} className="space-y-4">
                    <div>
                      <Label htmlFor="grade">Grade (0-100)</Label>
                      <Input
                        id="grade"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={gradeForm.grade}
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        value={gradeForm.feedback}
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                        placeholder="Provide feedback to the student"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-red-800 hover:bg-red-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Grade
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowGradeDialog(false)
                          setSelectedSubmission(null)
                          setGradeForm({ grade: "", feedback: "" })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Teaching Journal Tab */}
          <TabsContent value="journal" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-red-800">Teaching Journal</CardTitle>
                  <CardDescription>Record your daily teaching activities and observations</CardDescription>
                </div>
                <Dialog open={showAddJournal} onOpenChange={setShowAddJournal}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-800 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Journal Entry</DialogTitle>
                      <DialogDescription>Record your teaching activities for today</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleJournalSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={journalEntry.date}
                            onChange={(e) => setJournalEntry({ ...journalEntry, date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select onValueChange={(value) => setJournalEntry({ ...journalEntry, subject: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="filipino">Filipino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="topic">Topic/Lesson</Label>
                        <Input
                          id="topic"
                          value={journalEntry.topic}
                          onChange={(e) => setJournalEntry({ ...journalEntry, topic: e.target.value })}
                          placeholder="Enter the lesson topic"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="activities">Activities Conducted</Label>
                        <Textarea
                          id="activities"
                          value={journalEntry.activities}
                          onChange={(e) => setJournalEntry({ ...journalEntry, activities: e.target.value })}
                          placeholder="Describe the activities and methods used"
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes & Observations</Label>
                        <Textarea
                          id="notes"
                          value={journalEntry.notes}
                          onChange={(e) => setJournalEntry({ ...journalEntry, notes: e.target.value })}
                          placeholder="Student responses, challenges, improvements needed, etc."
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-red-800 hover:bg-red-700">
                        Save Entry
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {journalEntries.length > 0 ? (
                  <div className="space-y-4">
                    {journalEntries.map((entry) => (
                      <Card key={entry.id} className="border-l-4 border-l-red-800">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{entry.topic}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {entry.subject} • {new Date(entry.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJournal(entry.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Activities Conducted:</p>
                              <p className="text-sm text-gray-600">{entry.activities}</p>
                            </div>
                            {entry.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Notes & Observations:</p>
                                <p className="text-sm text-gray-600">{entry.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No journal entries found. Click "Add Entry" to create your first journal entry.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
