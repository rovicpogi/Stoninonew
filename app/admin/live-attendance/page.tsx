"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Radio,
  ArrowLeft,
  X,
  User,
  Clock,
  Calendar,
} from "lucide-react"

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  gradeLevel: string
  section: string
  scanTime: string
  status: string
  rfidCard: string
  studentPhoto?: string
}

export default function LiveAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)
  const [flashingRecord, setFlashingRecord] = useState<AttendanceRecord | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  const fetchLiveAttendance = useCallback(async (onlyNew = false) => {
    setLoadingAttendance(true)
    try {
      const url = onlyNew && lastScanTime
        ? `/api/admin/attendance-live?since=${lastScanTime}&limit=50`
        : `/api/admin/attendance-live?limit=50`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success && result.records) {
        if (onlyNew && result.records.length > 0) {
          // Prepend new records to the beginning
          setAttendanceRecords((prev) => {
            const newRecords = result.records.filter(
              (newRec: AttendanceRecord) => !prev.some((p) => p.id === newRec.id)
            )
            const updated = [...newRecords, ...prev].slice(0, 50)
            
            // Flash the newest record for 2 seconds
            if (newRecords.length > 0) {
              setFlashingRecord(newRecords[0])
              setShowFlash(true)
              
              // Hide after 2 seconds
              setTimeout(() => {
                setShowFlash(false)
                setTimeout(() => {
                  setFlashingRecord(null)
                }, 300) // Wait for fade out animation
              }, 2000)
            }
            
            return updated
          })
          // Update last scan time
          if (result.records[0]) {
            setLastScanTime(result.records[0].scanTime)
          }
        } else {
          // Initial load
          setAttendanceRecords(result.records)
          if (result.records.length > 0) {
            setLastScanTime(result.records[0].scanTime)
            // Flash the first record on initial load
            setFlashingRecord(result.records[0])
            setShowFlash(true)
            setTimeout(() => {
              setShowFlash(false)
              setTimeout(() => {
                setFlashingRecord(null)
              }, 300)
            }, 2000)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching live attendance:", error)
    } finally {
      setLoadingAttendance(false)
    }
  }, [lastScanTime])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Live attendance polling
  useEffect(() => {
    // Initial fetch
    fetchLiveAttendance()

    // Poll every 2 seconds for new records
    const interval = setInterval(() => {
      fetchLiveAttendance(true)
    }, 2000)

    return () => clearInterval(interval)
  }, [fetchLiveAttendance])

  const handleClose = () => {
    if (window.opener) {
      // If opened from another window, close this window
      window.close()
    } else {
      // Otherwise, redirect to admin page
      window.location.href = "/admin"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-red-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Sto Niño de Praga Academy Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-red-800 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-600" />
                  Live Attendance Monitoring
                </h1>
                <p className="text-sm text-gray-600">Sto Niño de Praga Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="border-red-800 text-red-800 hover:bg-red-800 hover:text-white bg-transparent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-140px)]">
        <div className="grid grid-cols-4 gap-4 h-full">
          {/* Left Side - Monitoring List (1/4 = 25%) */}
          <div className="col-span-1 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600" />
                  Live Scans
                </CardTitle>
                <CardDescription className="text-xs">
                  {attendanceRecords.length} records
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                {/* Status indicator */}
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-800">Active</span>
                  </div>
                </div>

                {/* Attendance Records List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {loadingAttendance && attendanceRecords.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-800 mx-auto mb-2"></div>
                        <p className="text-xs text-gray-600">Loading...</p>
                      </div>
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Radio className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No scans yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attendanceRecords.map((record, index) => (
                        <div
                          key={record.id}
                          className={`p-3 rounded-lg transition-all border ${
                            flashingRecord?.id === record.id && showFlash
                              ? "bg-green-100 border-green-400 shadow-lg ring-2 ring-green-400 ring-opacity-75"
                              : "bg-white border-gray-200"
                          } ${
                            index === 0 && attendanceRecords.length > 1 ? "ring-2 ring-green-400 ring-opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {record.studentName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {record.studentId}
                              </p>
                            </div>
                            {index === 0 && attendanceRecords.length > 1 && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs px-1 py-0">NEW</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">{record.gradeLevel}</span>
                            <span className="text-xs font-medium text-gray-900">
                              {formatTime(record.scanTime)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Student Details (3/4 = 75%) */}
          <div className="col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-red-800">Student Information</CardTitle>
                <CardDescription>
                  Information flashes when a new RFID scan is detected
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {flashingRecord && showFlash ? (
                  <div className={`w-full max-w-2xl transition-all duration-300 ${
                    showFlash ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}>
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                      {/* Student Photo */}
                      <div className="flex justify-center">
                        <div className="relative animate-pulse">
                          {flashingRecord.studentPhoto ? (
                            <Image
                              src={flashingRecord.studentPhoto}
                              alt={flashingRecord.studentName}
                              width={200}
                              height={200}
                              className="rounded-full border-4 border-red-800 shadow-lg"
                            />
                          ) : (
                            <div className="w-48 h-48 rounded-full border-4 border-red-800 bg-red-100 flex items-center justify-center shadow-lg">
                              <User className="w-24 h-24 text-red-600" />
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
                            <Radio className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Student Name */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-in slide-in-from-bottom-4 duration-500">
                          {flashingRecord.studentName}
                        </h2>
                        <p className="text-lg text-gray-600">Student ID: {flashingRecord.studentId}</p>
                      </div>

                      {/* Student Details */}
                      <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-gray-50 rounded-lg p-4 animate-in slide-in-from-left-4 duration-500 delay-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-gray-600">Grade Level</span>
                          </div>
                          <p className="text-xl font-semibold text-gray-900">{flashingRecord.gradeLevel}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 animate-in slide-in-from-right-4 duration-500 delay-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-gray-600">Section</span>
                          </div>
                          <p className="text-xl font-semibold text-gray-900">{flashingRecord.section}</p>
                        </div>
                      </div>

                      {/* Scan Time */}
                      <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <Clock className="w-6 h-6 text-red-600" />
                          <span className="text-lg font-semibold text-red-800">Scan Time</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatTime(flashingRecord.scanTime)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(flashingRecord.scanTime)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            RFID Card: {flashingRecord.rfidCard}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                            {flashingRecord.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Radio className="w-24 h-24 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 text-lg">Waiting for RFID scan...</p>
                    <p className="text-gray-400 text-sm mt-2">Student information will appear here when scanned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Updates every 2 seconds • Latest scan at the top • Keep this window open for continuous monitoring
          </p>
        </div>
      </div>
    </div>
  )
}
