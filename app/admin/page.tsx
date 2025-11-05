"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Clock,
  BarChart3,
  Settings,
  Home,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  Menu,
  X,
  Radio,
} from "lucide-react"

interface Student {
  id?: string
  student_id?: string
  first_name?: string
  last_name?: string
  grade_level?: string
  section?: string
  status?: string
  created_at?: string
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    attendanceRate: 0,
  })
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Load admin data from localStorage
    const admin = localStorage.getItem("admin")
    if (admin) {
      setAdminData(JSON.parse(admin))
    }
    setIsLoading(false)
  }, [])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch("/api/admin/students")
      const result = await response.json()
      if (result.success && result.students) {
        setStudents(result.students)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin")
    if (confirm("Are you sure you want to log out?")) {
      window.location.href = "/"
    }
  }

  const formatStudentName = (student: Student) => {
    const firstName = student.first_name || ""
    const lastName = student.last_name || ""
    return `${firstName} ${lastName}`.trim() || "N/A"
  }

  const handleOpenLiveAttendance = () => {
    window.open("/admin/live-attendance", "_blank", "noopener,noreferrer")
  }

  useEffect(() => {
    if (adminData && activeTab === "dashboard") {
      fetchStats()
    }
    if (adminData && activeTab === "students") {
      fetchStudents()
    }
  }, [adminData, activeTab])

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

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the Admin Portal</p>
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
      <header className="bg-white shadow-md border-b-4 border-red-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <Image
                src="/logo.png"
                alt="Sto Niño de Praga Academy Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-red-800">Admin Portal</h1>
                <p className="text-sm text-gray-600">Sto Niño de Praga Academy</p>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  onClick={handleOpenLiveAttendance}
                  variant="outline"
                  className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Live Attendance
                </Button>
                <div className="text-right">
                  <p className="font-medium text-red-800">
                    {adminData?.FirstName} {adminData?.LastName}
                  </p>
                  <p className="text-sm text-gray-600">{adminData?.Position || "System Administrator"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenLiveAttendance}
                  variant="outline"
                  size="sm"
                  className="md:hidden border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                >
                  <Radio className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                >
                  <span className="hidden md:inline">Logout</span>
                  <X className="w-4 h-4 md:hidden" />
                </Button>
              </div>
            </div>
          </div>
          <div className="md:hidden mt-2">
            <p className="text-sm font-medium text-red-800">
              {adminData?.FirstName} {adminData?.LastName}
            </p>
            <p className="text-xs text-gray-600">{adminData?.Position || "System Administrator"}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 gap-2 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-xs md:text-sm py-2"
            >
              <LayoutDashboard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger 
              value="attendance" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-xs md:text-sm py-2"
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Attendance</span>
              <span className="sm:hidden">Attend</span>
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-xs md:text-sm py-2"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Students</span>
              <span className="sm:hidden">Students</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-xs md:text-sm py-2"
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-red-800 data-[state=active]:text-white text-xs md:text-sm py-2"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Admin Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-2xl font-bold text-red-800">...</div>
                  ) : (
                    <div className="text-2xl font-bold text-red-800">
                      {stats.totalStudents.toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-gray-600">All grade levels</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Total Teachers</CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-2xl font-bold text-red-800">...</div>
                  ) : (
                    <div className="text-2xl font-bold text-red-800">
                      {stats.totalTeachers.toLocaleString()}
                    </div>
                  )}
                  <p className="text-xs text-gray-600">Active teachers</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <div className="text-2xl font-bold text-red-800">...</div>
                  ) : (
                    <div className="text-2xl font-bold text-red-800">
                      {stats.attendanceRate > 0 ? `${stats.attendanceRate.toFixed(1)}%` : "N/A"}
                    </div>
                  )}
                  <p className="text-xs text-gray-600">Overall average</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">System Status</CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">Online</div>
                  <p className="text-xs text-gray-600">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-sm">RFID System</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-sm">Student Portal</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-sm">Teacher Portal</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-sm">Database Connection</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Teachers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance and RFID */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Attendance and RFID Management</CardTitle>
                <CardDescription>Monitor attendance records and RFID system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Today's Attendance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">Students Present</span>
                        <span className="font-medium text-sm">Loading...</span>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">Teachers Present</span>
                        <span className="font-medium text-sm">Loading...</span>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">Overall Rate</span>
                        <span className="font-medium text-sm text-green-600">N/A</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">RFID System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">System Status</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">Active Cards</span>
                        <span className="font-medium text-sm">{stats.totalStudents}</span>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-sm">Last Sync</span>
                        <span className="font-medium text-sm">Real-time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Management */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Student Management</CardTitle>
                <CardDescription>Manage student records, enrollment, and academic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h4 className="font-medium">Student Records</h4>
                    <Button className="bg-red-800 hover:bg-red-700 w-full sm:w-auto">Add New Student</Button>
                  </div>
                  {loadingStudents ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No students found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px]">Student ID</TableHead>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead className="min-w-[100px]">Grade Level</TableHead>
                            <TableHead className="min-w-[100px]">Section</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id || student.student_id}>
                              <TableCell className="font-medium">
                                {student.student_id || "N/A"}
                              </TableCell>
                              <TableCell>{formatStudentName(student)}</TableCell>
                              <TableCell>{student.grade_level || "N/A"}</TableCell>
                              <TableCell>{student.section || "N/A"}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">
                                  {student.status || "Enrolled"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports and Analytics */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">Reports and Analytics</CardTitle>
                <CardDescription>Generate and view various school reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Academic Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Grade Reports
                      </Button>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Attendance Reports
                      </Button>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Performance Analytics
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Student Progress Reports
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Administrative Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Enrollment Reports
                      </Button>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        System Usage Reports
                      </Button>
                      <Button variant="outline" className="w-full mb-2 bg-transparent">
                        Student Directory
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Custom Reports
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">System Settings</CardTitle>
                <CardDescription>Configure system preferences and administrative settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">General Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input id="schoolName" defaultValue="Sto Niño de Praga Academy" />
                      </div>
                      <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        <Input id="academicYear" defaultValue="2024-2025" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">System Configuration</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm">Automatic Backup</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm">RFID Integration</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm">Email Notifications</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm">Student Portal Access</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm">Teacher Portal Access</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-red-800 hover:bg-red-700 w-full md:w-auto">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
