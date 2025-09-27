"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, ChevronLeft, ChevronRight, Calendar, Plus, Trash2, Download, Loader2, AlertCircle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { attendanceAPI, AttendanceRecord, AttendanceLog, AttendanceStatus } from "../utils/attendance-api"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface CalendarSectionProps {
  profileId?: string;
}

const CalendarSection = ({ profileId }: CalendarSectionProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })

  // API-based state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceData, setAttendanceData] = useState({
    presentDays: [] as number[],
    absentDays: [] as number[],
    holidayDays: [] as number[],
    eventDays: [] as number[], // Days with activity logs
    totalAttended: 0,
    totalHolidays: 0,
  })

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [editingRecords, setEditingRecords] = useState<AttendanceLog[]>([])

  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadStartDate, setDownloadStartDate] = useState("")
  const [downloadEndDate, setDownloadEndDate] = useState("")

  // API-related functions
  const fetchAttendanceData = useCallback(async () => {
    if (!profileId) {
      setError("Profile ID is required")
      return
    }

    // Helper function to recalculate event days from current records
    const recalculateEventDays = (records: AttendanceRecord[]): number[] => {
      const eventDays: number[] = []
      
      records.forEach(record => {
        if (record.logs && record.logs.length > 0) {
          const recordDate = new Date(record.date)
          const dayOfMonth = recordDate.getUTCDate()
          
          // Check if this record is for the current month/year being displayed
          if (recordDate.getUTCFullYear() === currentDate.getFullYear() && 
              recordDate.getUTCMonth() === currentDate.getMonth()) {
            eventDays.push(dayOfMonth)
          }
        }
      })
      
      return eventDays
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await attendanceAPI.getAttendance(
        profileId,
        currentDate.getMonth() + 1, // API expects 1-based month
        currentDate.getFullYear()
      )

      setAttendanceRecords(response.data.records)
      
      // Recalculate event days from the actual records for verification
      const recalculatedEventDays = recalculateEventDays(response.data.records)
      

      
      // Use recalculated event days to ensure accuracy
      setAttendanceData({
        presentDays: response.data.presentDays,
        absentDays: response.data.absentDays,
        holidayDays: response.data.holidayDays,
        eventDays: recalculatedEventDays, // Use our own calculation
        totalAttended: response.data.summary.totalPresent,
        totalHolidays: response.data.summary.totalHolidays,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance data")
      console.error("Error fetching attendance:", err)
    } finally {
      setIsLoading(false)
    }
  }, [profileId, currentDate])

  // Load attendance data when component mounts or date changes
  useEffect(() => {
    if (profileId) {
      fetchAttendanceData()
    }
  }, [fetchAttendanceData, profileId])

  const getCurrentDateKey = () => {
    return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${String(selectedDate).padStart(2, '0')}`
  }

  // Helper function to create UTC date for selected day to avoid timezone issues
  const createSelectedDateUTC = (): Date => {
    return new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), selectedDate))
  }

  // Helper function to create ISO string for selected day in UTC
  const getSelectedDateISOString = (): string => {
    return createSelectedDateUTC().toISOString()
  }

  const getCurrentDayLogs = (): AttendanceLog[] => {
    const targetDate = createSelectedDateUTC()
    const targetDateString = targetDate.toISOString().split('T')[0] // YYYY-MM-DD format
    

    
    const currentRecord = attendanceRecords.find(record => {
      const recordDate = new Date(record.date)
      const recordDateString = recordDate.toISOString().split('T')[0] // YYYY-MM-DD format
      const matches = recordDateString === targetDateString
      
      
      
      return matches
    })
    
    const logs = currentRecord?.logs || []
    return logs
  }

  const markAsPresent = async () => {
    if (!profileId || !selectedDate) return

    const dateStr = getSelectedDateISOString()

    try {
      setIsSaving(true)
      await attendanceAPI.setAttendanceStatus(profileId, dateStr, 'present')
      await fetchAttendanceData() // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to mark as present")
    } finally {
      setIsSaving(false)
    }
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const openDatePicker = () => {
    setTempDate({
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
    })
    setShowDatePicker(true)
  }

  const applyDateSelection = () => {
    setCurrentDate(new Date(tempDate.year, tempDate.month, 1))
    setShowDatePicker(false)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate
      const isPresent = attendanceData.presentDays.includes(day)
      const isAbsent = attendanceData.absentDays.includes(day)
      const hasEvent = attendanceData.eventDays.includes(day)
      const isSunday = (firstDay + day - 1) % 7 === 0
      
      // Debug logging for event indicators
     

      let cellClasses =
        "h-16 flex items-center justify-center text-sm font-medium cursor-pointer relative rounded-md transition-colors duration-150 "

      if (isSunday) {
        cellClasses += "bg-rose-100 text-gray-800 "
      } else {
        cellClasses += "bg-gray-50 hover:bg-gray-100 text-gray-800 "
      }

      if (isSelected) {
        cellClasses += "border-2 border-blue-400 bg-white "
      } else if (isPresent) {
        cellClasses += "border-2 border-green-400 "
      } else if (isAbsent) {
        cellClasses += "border-2 border-red-400 "
      }

      days.push(
        <div key={day} onClick={() => setSelectedDate(day)} className={cellClasses}>
          {day}
          {hasEvent && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-0.5"></div>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const openUpdateModal = () => {
    // Clear any previous editing state
    setEditingRecords([])
    setError(null)
    
    // Get fresh logs for the currently selected date
    const currentLogs = getCurrentDayLogs()
    
    // Deep copy to avoid reference issues
    const logsToEdit = currentLogs.map(log => ({
      ...log,
      id: log.id || Date.now().toString() + Math.random().toString(36).substring(2)
    }))
    
    setEditingRecords(logsToEdit)
    setShowUpdateModal(true)
  }

  const deleteRecord = (id: string) => {
    setEditingRecords((prev) => prev.filter((record) => record.id !== id))
  }

  const updateRecord = (id: string, field: string, value: string) => {
    setEditingRecords((prev) => prev.map((record) => 
      record.id === id ? { ...record, [field]: value } : record
    ))
  }

  const addNewRecord = () => {
    const newRecord: AttendanceLog = { 
      id: Date.now().toString(), 
      time: "", 
      activity: "",
      notes: ""
    }
    setEditingRecords((prev) => {
      const updated = [...prev, newRecord]
      return updated
    })
  }

  const cancelEdit = () => {
    setShowUpdateModal(false)
  }

  const saveRecords = async () => {
    if (!profileId) return

    const dateStr = getSelectedDateISOString()
    

    try {
      setIsSaving(true)
      
      // Filter out empty records
      const validRecords = editingRecords.filter(record => 
        record.time.trim() && record.activity.trim()
      )
      
      await attendanceAPI.updateActivityLogs(profileId, dateStr, validRecords)
      
      // Immediately update local state to show the dot indicator
      if (validRecords.length > 0) {
        setAttendanceData(prev => ({
          ...prev,
          eventDays: prev.eventDays.includes(selectedDate) 
            ? prev.eventDays 
            : [...prev.eventDays, selectedDate]
        }))
      } else {
        // Remove the day from eventDays if no valid records
        setAttendanceData(prev => ({
          ...prev,
          eventDays: prev.eventDays.filter(day => day !== selectedDate)
        }))
      }
      
      // Refresh data to get updated state from server
      await fetchAttendanceData()
      
      // Close modal and clear editing state
      setShowUpdateModal(false)
      setEditingRecords([])
    } catch (err: any) {
      console.error('❌ Failed to save records:', err)
      setError(err.message || "Failed to save records")
    } finally {
      setIsSaving(false)
    }
  }

  const openDownloadModal = () => {
    // Set default date range to current monthly view
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    setDownloadStartDate(startOfMonth.toISOString().split('T')[0])
    setDownloadEndDate(endOfMonth.toISOString().split('T')[0])
    setShowDownloadModal(true)
  }

  const downloadAttendanceData = async () => {
    if (!downloadStartDate || !downloadEndDate) {
      setError("Please select both start and end dates")
      return
    }

    try {
      setIsSaving(true)
      
      // Filter attendance records for the selected date range
      const startDate = new Date(downloadStartDate)
      const endDate = new Date(downloadEndDate)
      
      const filteredRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
      })

      // Create new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.text("Attendance Report", 20, 20)

      // Add date range
      doc.setFontSize(12)
      doc.text(`Date Range: ${downloadStartDate} to ${downloadEndDate}`, 20, 35)

      // Prepare table data
      const tableData: any[] = []

      if (filteredRecords.length > 0) {
        filteredRecords.forEach(record => {
          const recordDate = new Date(record.date)
          const formattedDate = recordDate.toISOString().split('T')[0]
          const attendanceStatus = record.status || "Not Marked"

          if (record.logs && record.logs.length > 0) {
            record.logs.forEach((log: AttendanceLog) => {
              tableData.push([formattedDate, attendanceStatus, log.time, log.activity])
            })
          } else {
            tableData.push([formattedDate, attendanceStatus, "No logs", "No activities recorded"])
          }
        })
      } else {
        tableData.push(["No records", "No data", "No logs", "No records found for selected date range"])
      }

      autoTable(doc, {
        head: [["Date", "Attendance Status", "Time", "Activity"]],
        body: tableData,
        startY: 50,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 80 },
        },
      })

      // Generate filename with date range
      const filename = `Attendance_${downloadStartDate}_to_${downloadEndDate}.pdf`

      // Download the PDF file
      doc.save(filename)
      
      // Close modal
      setShowDownloadModal(false)
      
    } catch (err: any) {
      setError(err.message || "Failed to download attendance data")
      console.error("Error downloading attendance:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Show error state
  if (error && !profileId) {
    return (
      <div className="bg-white w-full shadow-sm rounded-lg overflow-hidden p-8">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Profile ID is required to load attendance data</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white w-full shadow-sm rounded-lg overflow-hidden">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header with navigation and Mark as Present button */}
        <div className="flex items-center justify-between p-8 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-2xl font-semibold text-gray-900">{selectedDate}</span>
              <button
                onClick={openDatePicker}
                className="flex items-center space-x-2 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl font-semibold text-gray-900">{months[currentDate.getMonth()]}</span>
                <span className="text-2xl font-semibold text-gray-900">{currentDate.getFullYear()}</span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openDownloadModal}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={markAsPresent}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Mark as Present</span>
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-xs font-semibold text-center ${
                index === 0 ? "bg-rose-100 text-rose-800" : "text-gray-600"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="relative grid grid-cols-7 gap-3 p-8 border-b border-gray-200">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-gray-600">Loading attendance data...</span>
              </div>
            </div>
          )}
          {renderCalendarDays()}
        </div>

        {/* Attendance statistics section */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Total Attended days : <span className="font-semibold text-gray-900">{attendanceData.totalAttended}</span>
            </span>
            <span>
              Total holidays taken :{" "}
              <span className="font-semibold text-gray-900">
                {String(attendanceData.totalHolidays).padStart(2, "0")}
              </span>
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Record</h3>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  Updated on {selectedDate.toString().padStart(2, "0")}-
                  {(currentDate.getMonth() + 1).toString().padStart(2, "0")}-{currentDate.getFullYear()}
                </span>
                <button
                  onClick={openUpdateModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Update Record
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {getCurrentDayLogs().length > 0 ? (
                getCurrentDayLogs().map((record) => (
                  <div key={record.id} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-900 min-w-[60px]">{record.time}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-700">{record.activity}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No logs found for this date</p>
                  <p className="text-xs mt-1">
                    Click "Update Record" to add logs for {selectedDate} {months[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date picker dialog */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={tempDate.month}
                  onChange={(e) =>
                    setTempDate((prev) => ({
                      ...prev,
                      month: Number.parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={tempDate.year}
                  onChange={(e) =>
                    setTempDate((prev) => ({
                      ...prev,
                      year: Number.parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyDateSelection}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#00000057]  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Daily Records</h3>
              <p className="text-sm text-gray-600 mt-1">Edit your daily activity records</p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {editingRecords.map((record, index) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Record {index + 1}</span>
                      <button
                        onClick={() => deleteRecord(record.id || "")}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="text"
                          value={record.time}
                          onChange={(e) => updateRecord(record.id || "", "time", e.target.value)}
                          placeholder="e.g., 4:30 pm"
                          className="w-full px-3 py-2 border border-gray-300 text-gray-400 font-semibold rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Activity</label>
                        <input
                          type="text"
                          value={record.activity}
                          onChange={(e) => updateRecord(record.id || "", "activity", e.target.value)}
                          placeholder="e.g., Work Log Out"
                          className="w-full px-3 py-2 border border-gray-300 text-gray-400 font-semibold rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addNewRecord}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Record
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRecords}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Date Range Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-[#00000057] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Download Attendance Report</h3>
              <p className="text-sm text-gray-600 mt-1">Select the date range for your report</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={downloadStartDate}
                  onChange={(e) => setDownloadStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={downloadEndDate}
                  onChange={(e) => setDownloadEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={downloadStartDate}
                />
              </div>

              {error && downloadStartDate && downloadEndDate && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDownloadModal(false)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={downloadAttendanceData}
                disabled={isSaving || !downloadStartDate || !downloadEndDate}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CalendarSection
