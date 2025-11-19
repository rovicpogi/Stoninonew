"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  FileText,
  User,
  Home,
  Bell,
  Search,
  ChevronRight,
  Calendar,
  Menu,
  X,
  LogOut,
  Upload,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react"

export default function StudentDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard")
  const [studentData, setStudentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submitFile, setSubmitFile] = useState<File | null>(null)

  useEffect(() => {
    // Load student data from localStorage
    const student = localStorage.getItem("student")
    if (student) {
      setStudentData(JSON.parse(student))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Fetch assignments and submissions when on assignments tab
    if (studentData && activeNav === "assignments") {
      fetchAssignments()
      fetchSubmissions()
    }
  }, [studentData, activeNav])

  const fetchAssignments = async () => {
    if (!studentData) return
    try {
      const params = new URLSearchParams()
      if (studentData.grade_level) params.append("grade_level", studentData.grade_level)
      if (studentData.section) params.append("section", studentData.section)
      
      const response = await fetch(`/api/student/assignments?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setAssignments(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    }
  }

  const fetchSubmissions = async () => {
    if (!studentData?.email) return
    try {
      const response = await fetch(`/api/student/submissions?student_email=${encodeURIComponent(studentData.email)}`)
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    }
  }

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment || !submitFile || !studentData?.email) {
      alert("Please select a file to submit")
      return
    }

    const formData = new FormData()
    formData.append("assignment_id", selectedAssignment.id)
    formData.append("student_email", studentData.email)
    formData.append("student_id", studentData.id || "")
    formData.append("file", submitFile)

    try {
      const response = await fetch("/api/student/submissions", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert(result.message || "Assignment submitted successfully!")
        setShowSubmitDialog(false)
        setSelectedAssignment(null)
        setSubmitFile(null)
        fetchSubmissions()
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit assignment")
    }
  }

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s: any) => s.assignment_id === assignmentId)
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("student")
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the Student Portal</p>
          <Link href="/">
            <Button className="bg-red-800 hover:bg-red-700">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/logo.png"
              alt="Sto Niño de Praga Academy Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-800">Student Portal</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Sto Niño de Praga Academy</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {studentData?.first_name?.[0] || 'S'}{studentData?.last_name?.[0] || 'T'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {studentData?.first_name} {studentData?.last_name}
                </p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white min-h-screen border-r border-gray-200">
          <nav className="mt-6">
            <div className="px-4 space-y-1">
              <button
                onClick={() => setActiveNav("dashboard")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "dashboard"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveNav("enrollment")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "enrollment"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                Enrollment
              </button>

              <button
                onClick={() => setActiveNav("schedule")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "schedule"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Schedule Calendar
              </button>

              <button
                onClick={() => setActiveNav("assignments")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "assignments"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                Assignments
              </button>

              <button
                onClick={() => setActiveNav("grades")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "grades"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <GraduationCap className="w-4 h-4 mr-3" />
                Grades & Reports
              </button>

              <button
                onClick={() => setActiveNav("profile")}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                  activeNav === "profile"
                    ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="mt-4">
                <div className="px-4 space-y-1">
                  <button
                    onClick={() => {
                      setActiveNav("dashboard")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "dashboard"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-3" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav("enrollment")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "enrollment"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Enrollment
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav("schedule")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "schedule"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Schedule Calendar
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav("assignments")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "assignments"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Assignments
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav("grades")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "grades"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mr-3" />
                    Grades & Reports
                  </button>

                  <button
                    onClick={() => {
                      setActiveNav("profile")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-left text-sm rounded-md transition-colors ${
                      activeNav === "profile"
                        ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                </div>

                {/* Mobile User Info */}
                <div className="mt-8 px-4 py-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-medium">
                      {studentData?.first_name?.[0] || 'S'}{studentData?.last_name?.[0] || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {studentData?.first_name} {studentData?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">Student</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Welcome back, {studentData?.first_name}!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Here's your academic overview for today.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Current GPA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="flex items-center mt-1">
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">Loading data...</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Attendance Rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="flex items-center mt-1">
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">Loading data...</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Active Courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="flex items-center mt-1">
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">Loading data...</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Pending Tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="flex items-center mt-1">
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">Loading data...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assignments and Course Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Assignments */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Recent Assignments</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Your latest assignments and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-8">
                      No assignments found. Data will be loaded from database.
                    </div>
                  </CardContent>
                </Card>

                {/* Course Progress */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">Course Progress</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Your progress in current subjects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-8">
                      No course progress data found. Data will be loaded from database.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeNav === "assignments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Assignments & Lessons</h2>
                <p className="text-sm sm:text-base text-gray-600">View and submit your assignments</p>
              </div>

              <div className="space-y-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => {
                    const submission = getSubmissionForAssignment(assignment.id)
                    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
                    const isSubmitted = !!submission

                    return (
                      <Card key={assignment.id} className="bg-white border border-gray-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                  {assignment.title}
                                </CardTitle>
                                <Badge variant={assignment.type === "assignment" ? "default" : "secondary"}>
                                  {assignment.type}
                                </Badge>
                                {isSubmitted && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Submitted
                                  </Badge>
                                )}
                                {assignment.type === "assignment" && !isSubmitted && isOverdue && (
                                  <Badge variant="destructive">Overdue</Badge>
                                )}
                              </div>
                              {assignment.description && (
                                <CardDescription className="mt-2">{assignment.description}</CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {assignment.subject && <span>Subject: {assignment.subject}</span>}
                              {assignment.grade_level && <span>Grade: {assignment.grade_level}</span>}
                              {assignment.section && <span>Section: {assignment.section}</span>}
                              {assignment.due_date && (
                                <span className={isOverdue && !isSubmitted ? "text-red-600 font-medium" : ""}>
                                  Due: {new Date(assignment.due_date).toLocaleString()}
                                </span>
                              )}
                              <span>Posted: {new Date(assignment.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={assignment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-800 hover:underline flex items-center gap-1 text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
                                Download {assignment.file_name}
                              </a>
                            </div>

                            {assignment.type === "assignment" && (
                              <div className="pt-3 border-t border-gray-200">
                                {isSubmitted ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">Your Submission:</span>
                                      <Badge
                                        variant={
                                          submission?.status === "graded"
                                            ? "default"
                                            : submission?.status === "returned"
                                            ? "secondary"
                                            : "outline"
                                        }
                                      >
                                        {submission?.status || "submitted"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={submission?.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-red-800 hover:underline flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3" />
                                        {submission?.file_name}
                                      </a>
                                      <span className="text-xs text-gray-500">
                                        Submitted: {new Date(submission?.submitted_at).toLocaleString()}
                                      </span>
                                    </div>
                                    {submission?.grade !== null && (
                                      <div className="text-sm">
                                        <span className="font-medium">Grade: </span>
                                        <span className="text-red-800 font-semibold">
                                          {submission.grade}/100
                                        </span>
                                      </div>
                                    )}
                                    {submission?.feedback && (
                                      <div className="text-sm">
                                        <span className="font-medium">Feedback: </span>
                                        <span className="text-gray-700">{submission.feedback}</span>
                                      </div>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAssignment(assignment)
                                        setSubmitFile(null)
                                        setShowSubmitDialog(true)
                                      }}
                                    >
                                      <Upload className="w-4 h-4 mr-1" />
                                      Resubmit
                                    </Button>
                                  </div>
                                ) : (
                                  <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                                    <DialogTrigger asChild>
                                      <Button
                                        className="bg-red-800 hover:bg-red-700"
                                        onClick={() => setSelectedAssignment(assignment)}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit Assignment
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Submit Assignment</DialogTitle>
                                        <DialogDescription>
                                          Upload your completed assignment file
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedAssignment && (
                                        <form onSubmit={handleSubmitAssignment} className="space-y-4">
                                          <div>
                                            <Label>Assignment: {selectedAssignment.title}</Label>
                                            {selectedAssignment.due_date && (
                                              <p className="text-sm text-gray-600 mt-1">
                                                Due: {new Date(selectedAssignment.due_date).toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            <Label htmlFor="submit-file">Upload File *</Label>
                                            <Input
                                              id="submit-file"
                                              type="file"
                                              onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                                              required
                                            />
                                            {submitFile && (
                                              <p className="text-sm text-gray-600 mt-1">
                                                Selected: {submitFile.name}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button type="submit" className="flex-1 bg-red-800 hover:bg-red-700">
                                              <Upload className="w-4 h-4 mr-2" />
                                              Submit
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              onClick={() => {
                                                setShowSubmitDialog(false)
                                                setSelectedAssignment(null)
                                                setSubmitFile(null)
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </form>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="py-8">
                      <div className="text-center text-gray-500">
                        No assignments or lessons available yet.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeNav === "enrollment" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Enrollment</h2>
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle>Enrollment Status</CardTitle>
                  <CardDescription>Your current enrollment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 py-8">
                      No enrollment data found. Data will be loaded from database.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeNav === "schedule" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Calendar</h2>
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                  <CardDescription>Your weekly class schedule and important dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    No schedule data found. Data will be loaded from database.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeNav === "grades" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Grades & Reports</h2>
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle>Current Grades</CardTitle>
                  <CardDescription>Your grades for the current semester</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    No grades data found. Data will be loaded from database.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeNav === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your student profile and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">
                        {studentData?.first_name} {studentData?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                      <p className="text-gray-900">{studentData?.student_id || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                      <p className="text-gray-900">{studentData?.grade_level || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <p className="text-gray-900">{studentData?.section || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{studentData?.email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <p className="text-gray-900">{studentData?.contact_number || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
