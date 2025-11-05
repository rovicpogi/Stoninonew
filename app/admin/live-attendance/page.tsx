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
}

export default function LiveAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)

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
            return [...newRecords, ...prev].slice(0, 50) // Keep only latest 50
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
      month: "short",
      day: "numeric",
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-800">Real-time RFID Scan Monitoring</CardTitle>
            <CardDescription>
              New scans appear automatically. Updates every 2 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Monitoring Active</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {attendanceRecords.length} Recent Scans
                </Badge>
              </div>

              {/* Attendance Records List */}
              <div className="border rounded-lg max-h-[70vh] overflow-y-auto">
                {loadingAttendance && attendanceRecords.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading attendance records...</p>
                    </div>
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No attendance records yet</p>
                      <p className="text-sm text-gray-500 mt-2">Waiting for RFID scans...</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {attendanceRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          index === 0 && attendanceRecords.length > 1 ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{record.studentName}</p>
                                <p className="text-sm text-gray-600">
                                  {record.studentId} • {record.gradeLevel} • {record.section}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">{record.status}</Badge>
                              {index === 0 && attendanceRecords.length > 1 && (
                                <Badge className="bg-blue-100 text-blue-800 animate-pulse">NEW</Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatTime(record.scanTime)}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(record.scanTime)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Updates every 2 seconds • Latest scan at the top • Keep this window open for continuous monitoring
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

