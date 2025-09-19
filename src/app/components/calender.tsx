"use client"

import { useState } from "react"
import { Pencil, ChevronLeft, ChevronRight, Calendar, Plus, Trash2 } from "lucide-react"

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)) // March 2025
  const [selectedDate, setSelectedDate] = useState(12)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState({
    month: 2, // March (0-indexed)
    year: 2025,
  })

  const [attendanceData, setAttendanceData] = useState({
    presentDays: [13, 14, 18, 19], // Green border days
    absentDays: [15], // Red border days
    eventDays: [12, 21], // Days with blue dots
    totalAttended: 20,
    totalHolidays: 4,
  })

  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const [dailyRecordsPerDate, setDailyRecordsPerDate] = useState<
    Record<string, Array<{ id: number; time: string; activity: string }>>
  >({
    "2025-2-12": [
      { id: 1, time: "4:30 pm", activity: "Work Log Out" },
      { id: 2, time: "6:30 pm", activity: "Interview at Riverleaf" },
    ],
  })

  const getCurrentDateKey = () => {
    return `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`
  }

  const getCurrentDayLogs = () => {
    const dateKey = getCurrentDateKey()
    return dailyRecordsPerDate[dateKey] || []
  }

  const [editingRecords, setEditingRecords] = useState<Array<{ id: number; time: string; activity: string }>>([])

  const markAsPresent = () => {
    if (selectedDate && !attendanceData.presentDays.includes(selectedDate)) {
      setAttendanceData((prev) => ({
        ...prev,
        presentDays: [...prev.presentDays, selectedDate],
        absentDays: prev.absentDays.filter((day) => day !== selectedDate),
        totalAttended: prev.totalAttended + 1,
      }))
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
    const dateKey = getCurrentDateKey()
    setEditingRecords(dailyRecordsPerDate[dateKey] || [])
    setShowUpdateModal(true)
  }

  const deleteRecord = (id: number) => {
    setEditingRecords((prev) => prev.filter((record) => record.id !== id))
  }

  const updateRecord = (id: number, field: string, value: string) => {
    setEditingRecords((prev) => prev.map((record) => (record.id === id ? { ...record, [field]: value } : record)))
  }

  const addNewRecord = () => {
    const newRecord = { id: Date.now(), time: "", activity: "" }
    setEditingRecords((prev) => [...prev, newRecord])
  }

  const cancelEdit = () => {
    setShowUpdateModal(false)
  }

  const saveRecords = () => {
    const dateKey = getCurrentDateKey()
    setDailyRecordsPerDate((prev) => ({
      ...prev,
      [dateKey]: editingRecords,
    }))
    setShowUpdateModal(false)
  }

  return (
    <>
      <div className="bg-white w-full shadow-sm rounded-lg overflow-hidden">
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

          <button
            onClick={markAsPresent}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Mark as Present
          </button>
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

        <div className="grid grid-cols-7 gap-3 p-8 border-b border-gray-200">{renderCalendarDays()}</div>

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
                        onClick={() => deleteRecord(record.id)}
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
                          onChange={(e) => updateRecord(record.id, "time", e.target.value)}
                          placeholder="e.g., 4:30 pm"
                          className="w-full px-3 py-2 border border-gray-300 text-gray-400 font-semibold rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Activity</label>
                        <input
                          type="text"
                          value={record.activity}
                          onChange={(e) => updateRecord(record.id, "activity", e.target.value)}
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CalendarSection
