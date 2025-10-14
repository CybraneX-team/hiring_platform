"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Pencil, ChevronLeft, ChevronRight, Calendar, Plus, Trash2, Download, Loader2, AlertCircle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { attendanceAPI, AttendanceRecord, AttendanceLog, AttendanceStatus, HiredCompany } from "../utils/attendance-api"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface CalendarSectionProps {
  profileId?: string;
  userId?: string;
}

const CalendarSection = ({ profileId, userId }: CalendarSectionProps) => {
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
    eventDays: [] as number[],
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
  const [companyName, setCompanyName] = useState("")
  const [projectName, setProjectName] = useState("")

  // Hired companies state
  const [hiredCompanies, setHiredCompanies] = useState<HiredCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [isManualCompanyInput, setIsManualCompanyInput] = useState(false)

  // API-related functions
  const fetchAttendanceData = useCallback(async () => {
    if (!profileId) {
      setError("Profile ID is required")
      return
    }

    const recalculateEventDays = (records: AttendanceRecord[]): number[] => {
      const eventDays: number[] = []
      
      records.forEach(record => {
        if (record.logs && record.logs.length > 0) {
          const recordDate = new Date(record.date)
          const dayOfMonth = recordDate.getUTCDate()
          
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
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      )

      setAttendanceRecords(response.data.records)
      
      const recalculatedEventDays = recalculateEventDays(response.data.records)

      setAttendanceData({
        presentDays: response.data.presentDays,
        absentDays: response.data.absentDays,
        holidayDays: response.data.holidayDays,
        eventDays: recalculatedEventDays,
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

  const fetchHiredCompanies = useCallback(async () => {
    if (!userId) return
    
    setCompaniesLoading(true)
    try {
      const response = await attendanceAPI.getHiredCompanies(userId)
      setHiredCompanies(response.data)
      
      if (response.data.length > 0 && !companyName) {
        setCompanyName(response.data[0].company.name)
      }
    } catch (err: any) {
      console.error('Error fetching hired companies:', err)
    } finally {
      setCompaniesLoading(false)
    }
  }, [userId, companyName])

  useEffect(() => {
    if (profileId) {
      fetchAttendanceData()
    }
  }, [fetchAttendanceData, profileId])

  useEffect(() => {
    if (userId) {
      fetchHiredCompanies()
    }
  }, [fetchHiredCompanies, userId])

  const companyDropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false)
      }
    }

    if (showCompanyDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCompanyDropdown])

  const getCurrentDateKey = () => {
    return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${String(selectedDate).padStart(2, '0')}`
  }

  const createSelectedDateUTC = (): Date => {
    return new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), selectedDate))
  }

  const getSelectedDateISOString = (): string => {
    return createSelectedDateUTC().toISOString()
  }

  const getCurrentDayLogs = (): AttendanceLog[] => {
    const targetDate = createSelectedDateUTC()
    const targetDateString = targetDate.toISOString().split('T')[0]
    
    const currentRecord = attendanceRecords.find(record => {
      const recordDate = new Date(record.date)
      const recordDateString = recordDate.toISOString().split('T')[0]
      return recordDateString === targetDateString
    })
    
    return currentRecord?.logs || []
  }

  const isSelectedDatePresent = (): boolean => {
    return attendanceData.presentDays.includes(selectedDate)
  }

  const markAsPresent = async () => {
    if (!profileId || !selectedDate) return

    const dateStr = getSelectedDateISOString()

    try {
      setIsSaving(true)
      await attendanceAPI.setAttendanceStatus(profileId, dateStr, 'present')
      await fetchAttendanceData()
    } catch (err: any) {
      setError(err.message || "Failed to mark as present")
    } finally {
      setIsSaving(false)
    }
  }

  const unmarkAsPresent = async () => {
    if (!profileId || !selectedDate) return

    const dateStr = getSelectedDateISOString()

    try {
      setIsSaving(true)
      await attendanceAPI.updateAttendance(profileId, dateStr, { 
        status: 'none', 
        logs: [] 
      })
      await fetchAttendanceData()
    } catch (err: any) {
      setError(err.message || "Failed to unmark as present")
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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>)
    }

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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const openUpdateModal = () => {
    if (!isSelectedDatePresent()) {
      setError("You must mark yourself as present first before logging daily activities")
      return
    }
    
    setEditingRecords([])
    setError(null)
    
    const currentLogs = getCurrentDayLogs()
    
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
    setEditingRecords((prev) => [...prev, newRecord])
  }

  const cancelEdit = () => {
    setShowUpdateModal(false)
  }

  const saveRecords = async () => {
    if (!profileId) return

    const dateStr = getSelectedDateISOString()

    try {
      setIsSaving(true)
      
      const validRecords = editingRecords.filter(record => 
        record.time.trim() && record.activity.trim()
      )
      
      await attendanceAPI.updateActivityLogs(profileId, dateStr, validRecords)
      
      if (validRecords.length > 0) {
        setAttendanceData(prev => ({
          ...prev,
          eventDays: prev.eventDays.includes(selectedDate) 
            ? prev.eventDays 
            : [...prev.eventDays, selectedDate]
        }))
      } else {
        setAttendanceData(prev => ({
          ...prev,
          eventDays: prev.eventDays.filter(day => day !== selectedDate)
        }))
      }
      
      await fetchAttendanceData()
      setShowUpdateModal(false)
      setEditingRecords([])
    } catch (err: any) {
      console.error('Failed to save records:', err)
      setError(err.message || "Failed to save records")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompanySelect = (company: HiredCompany) => {
    setCompanyName(company.company.name)
    setShowCompanyDropdown(false)
    setIsManualCompanyInput(false)
  }

  const handleManualCompanyInput = () => {
    setIsManualCompanyInput(true)
    setShowCompanyDropdown(false)
    setCompanyName("")
  }

  const openDownloadModal = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    setDownloadStartDate(startOfMonth.toISOString().split('T')[0])
    setDownloadEndDate(endOfMonth.toISOString().split('T')[0])
    
    if (!companyName && hiredCompanies.length > 0) {
      setCompanyName(hiredCompanies[0].company.name)
    }
    
    setShowDownloadModal(true)
  }

  const downloadAttendanceData = async () => {
    if (!downloadStartDate || !downloadEndDate) {
      setError("Please select both start and end dates")
      return
    }

    if (!companyName.trim()) {
      setError("Please enter company name")
      return
    }

    if (!projectName.trim()) {
      setError("Please enter project name")
      return
    }

    try {
      setIsSaving(true)
      
      const startDate = new Date(downloadStartDate)
      const endDate = new Date(downloadEndDate)
      
      const filteredRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
      })

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const selectedCompany = hiredCompanies.find(company => 
        company.company.name === companyName.trim()
      )
      const companyLogo = selectedCompany?.company.logo

      doc.setFillColor(0, 82, 180)
      doc.rect(0, 0, pageWidth, 30, 'F')

      if (companyLogo) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                const logoSize = 20
                canvas.width = logoSize
                canvas.height = logoSize
                
                if (ctx) {
                  ctx.fillStyle = 'white'
                  ctx.fillRect(0, 0, logoSize, logoSize)
                  ctx.drawImage(img, 0, 0, logoSize, logoSize)
                  
                  const base64Image = canvas.toDataURL('image/PNG')
                  doc.addImage(base64Image, 'PNG', 6, 5, 20, 20)
                }
                resolve()
              } catch (error) {
                console.warn('Error processing company logo:', error)
                resolve()
              }
            }
            
            img.onerror = () => {
              console.warn('Failed to load company logo')
              resolve()
            }
            
            setTimeout(() => {
              console.warn('Logo loading timeout')
              resolve()
            }, 5000)
            
            img.src = companyLogo
          })
        } catch (error) {
          console.warn('Error adding company logo to PDF:', error)
        }
      } else if (selectedCompany) {
        try {
          const companyInitial = selectedCompany.company.name.charAt(0).toUpperCase()
          
          doc.setFillColor(59, 130, 246)
          doc.circle(16, 15, 10, 'F')
          
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text(companyInitial, 13, 18)
        } catch (error) {
          console.warn('Error adding company initial:', error)
        }
      }

      doc.setTextColor(0, 255, 0)
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      const compscopeText = "ProjectMATCH by Compscope "
      const compscopeWidth = doc.getTextWidth(compscopeText)
      doc.text(compscopeText, (pageWidth - compscopeWidth) / 2, 16)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      const workReportText = "Work Report"
      const workReportWidth = doc.getTextWidth(workReportText)
      doc.text(workReportText, (pageWidth - workReportWidth) / 2, 24)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)

      const startY = 40
      const valueStartX = 65
      
      doc.setFont('helvetica', 'bold')
      doc.text('Vendor Name -', 20, startY)
      doc.setFont('helvetica', 'normal')
      doc.text(companyName.trim(), valueStartX, startY)

      doc.setFont('helvetica', 'bold')
      doc.text('Project Name -', 20, startY + 8)
      doc.setFont('helvetica', 'normal')
      doc.text(projectName.trim(), valueStartX, startY + 8)

      doc.setFont('helvetica', 'bold')
      doc.text('Report Period -', 20, startY + 16)
      doc.setFont('helvetica', 'normal')
      const formattedStartDate = new Date(downloadStartDate).toLocaleDateString('en-GB')
      const formattedEndDate = new Date(downloadEndDate).toLocaleDateString('en-GB')
      doc.text(`${formattedStartDate} to ${formattedEndDate}`, valueStartX, startY + 16)

      const tableData: any[] = []

      if (filteredRecords.length > 0) {
        filteredRecords.forEach(record => {
          const recordDate = new Date(record.date)
          const formattedDate = recordDate.toLocaleDateString('en-GB')
          const attendanceStatus = record.status === 'present' ? 'Present' : 
                                 record.status === 'absent' ? 'Absent' : 'Not Marked'

          const hasAttendanceStatus = record.status === 'present' || record.status === 'absent'
          const hasActivities = record.logs && record.logs.length > 0

          if (hasAttendanceStatus || hasActivities) {
            if (record.logs && record.logs.length > 0) {
              record.logs.forEach((log: AttendanceLog) => {
                tableData.push([
                  formattedDate, 
                  log.activity, 
                  attendanceStatus,
                  log.time
                ])
              })
            } else {
              if (hasAttendanceStatus) {
                tableData.push([
                  formattedDate, 
                  "No activities recorded", 
                  attendanceStatus,
                  "-"
                ])
              }
            }
          }
        })
      }
      
      if (tableData.length === 0) {
        tableData.push(["No records", "No records found for the selected period", "", ""])
      }

      autoTable(doc, {
        head: [["Date", "Activity", "Attendance (Present / Absent)", "Timing of Work"]],
        body: tableData,
        startY: 68,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 5,
          font: 'helvetica',
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'center' },
          1: { cellWidth: 60, halign: 'left' },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' },
        },
        margin: { left: 15, right: 15 },
      })

      const totalPages = doc.getNumberOfPages()
      const lastPage = totalPages
      
      doc.setPage(lastPage)
      const signatureY = pageHeight - 40
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('Surveyor Sign & Seal', 20, signatureY)
      doc.setFont('helvetica', 'normal')
      doc.text('Surveyor Name -', 20, signatureY + 8)
      
      doc.setFont('helvetica', 'bold')
      doc.text('Client / Mail Sign & Seal', pageWidth - 80, signatureY)
      
      const currentDateObj = new Date()
      const formattedDate = `${String(currentDateObj.getDate()).padStart(2, '0')}/${String(currentDateObj.getMonth() + 1).padStart(2, '0')}/${currentDateObj.getFullYear()}`
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        const footerText = `Extracted from ProjectMATCH, COMPSCOPE Nonmetallics | www.compscope.in | Generated on: ${formattedDate}`
        const footerWidth = doc.getTextWidth(footerText)
        doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10)
      }

      const sanitizedCompanyName = companyName.trim().replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${sanitizedCompanyName}_Attendance_${downloadStartDate}_to_${downloadEndDate}.pdf`

      doc.save(filename)
      setShowDownloadModal(false)
      
    } catch (err: any) {
      setError(err.message || "Failed to download attendance data")
      console.error("Error downloading attendance:", err)
    } finally {
      setIsSaving(false)
    }
  }

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

        {/* Header with navigation - Desktop layout */}
        <div className="hidden md:flex items-center justify-between p-8 bg-white border-b border-gray-200">
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
            {isSelectedDatePresent() ? (
              <button
                onClick={unmarkAsPresent}
                disabled={isSaving}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Unmark as Present</span>
              </button>
            ) : (
              <button
                onClick={markAsPresent}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Mark as Present</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile header - Navigation only */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">{selectedDate}</span>
            <button
              onClick={openDatePicker}
              className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900">{months[currentDate.getMonth()]}</span>
              <span className="text-sm font-semibold text-gray-900">{currentDate.getFullYear()}</span>
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
{/* Top action buttons - Mobile first, stacked */}
        <div className="p-4 md:p-0 md:hidden bg-white border-b border-gray-200 flex  gap-2">
          <button
            onClick={openDownloadModal}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors w-full"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          {isSelectedDatePresent() ? (
            <button
              onClick={unmarkAsPresent}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors w-full"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Unmark Present</span>
            </button>
          ) : (
            <button
              onClick={markAsPresent}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors w-full"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Mark Present</span>
            </button>
          )}
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

        <div className="relative grid grid-cols-7 gap-3 p-4 md:p-8 border-b border-gray-200">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          {renderCalendarDays()}
        </div>

        {/* Attendance statistics section */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-600">
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

        <div className="p-4 md:p-8">
          <div className="bg-gray-100 rounded-lg p-4 md:p-6">
            <div className="flex  md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Record</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-xs text-gray-500 hidden md:inline-block">
                  Updated on {selectedDate.toString().padStart(2, "0")}-
                  {(currentDate.getMonth() + 1).toString().padStart(2, "0")}-{currentDate.getFullYear()}
                </span>
                <div className="flex flex-col items-center justify-center">
                <button
                  onClick={openUpdateModal}
                  disabled={!isSelectedDatePresent()}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                    isSelectedDatePresent() 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!isSelectedDatePresent() ? "Mark yourself as present first to log activities" : ""}
                >
                  <Pencil className="w-4 h-4" />
                  Update Record
                  
                </button>
                <span className="text-[10px] text-gray-500 md:hidden mt-1">
                  Updated on {selectedDate.toString().padStart(2, "0")}-
                  {(currentDate.getMonth() + 1).toString().padStart(2, "0")}-{currentDate.getFullYear()}
                </span>
                </div>
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
        <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
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

      {/* Update modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#00000057] flex items-center justify-center z-50 p-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                {isManualCompanyInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name manually"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualCompanyInput(false)
                        setCompanyName(hiredCompanies.length > 0 ? hiredCompanies[0].company.name : "")
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← Back to hired companies
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={companyDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between bg-white"
                    >
                      <span className={companyName ? "text-gray-900" : "text-gray-500"}>
                        {companyName || "Select a company or enter manually"}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showCompanyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {companiesLoading ? (
                          <div className="p-3 text-center text-gray-500">Loading hired companies...</div>
                        ) : hiredCompanies.length > 0 ? (
                          <>
                            {hiredCompanies.map((company) => (
                              <button
                                key={company.applicationId}
                                type="button"
                                onClick={() => handleCompanySelect(company)}
                                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                              >
                                <div className="flex-shrink-0">
                                  {company.company.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={company.company.logo} 
                                      alt={`${company.company.name} logo`}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 font-medium text-sm">
                                        {company.company.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {company.company.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Hired for: {company.jobTitle}
                                  </p>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={handleManualCompanyInput}
                              className="w-full p-3 text-left hover:bg-gray-50 border-t border-gray-200 text-blue-600 font-medium"
                            >
                              + Enter company name manually
                            </button>
                          </>
                        ) : (
                          <div className="p-3">
                            <p className="text-sm text-gray-500 mb-2">No hired positions found</p>
                            <button
                              type="button"
                              onClick={handleManualCompanyInput}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Enter company name manually
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

              {error && (downloadStartDate && downloadEndDate || companyName || projectName) && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col md:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowDownloadModal(false)
                  setError(null)
                  setCompanyName("")
                  setProjectName("")
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={downloadAttendanceData}
                disabled={isSaving || !downloadStartDate || !downloadEndDate || !companyName.trim() || !projectName.trim()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
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