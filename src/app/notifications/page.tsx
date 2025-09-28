'use client'
import { Mail, Search } from "lucide-react"
import JobHeader from "../components/jobHeader"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


// const notifications = [
//   {
//     id: 1,
//     company: "Riverleaf Corp",
//     label: "Hiring Manager - Josh",
//     title: "Lorem Ipsum dolor sit amet",
//     description:
//       "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
//     timestamp: "5 Days ago",
//     isUnread: true,
//     avatar: "R",
//   },
//   {
//     id: 2,
//     company: "Riverleaf Corp",
//     label:  "Hiring Manager - Josh",
//     title: "Lorem Ipsum dolor sit amet",
//     description:
//       "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
//     timestamp: "5 Days ago",
//     isUnread: false,
//     avatar: "R",
//   },
//   {
//     id: 3,
//     company: "Riverleaf Corp",
//     label:  "Hiring Manager - Josh",
//     title: "Lorem Ipsum dolor sit amet",
//     description:
//       "We are seeking a detail-oriented and proactive Payroll Specialist to support our Finance function, specifically managing payroll accounting, reconciliations, and payroll-related financial reporting across multiple international jurisdictions (excluding North America).",
//     timestamp: "5 Days ago",
//     isUnread: false,
//     avatar: "R",
//   },
// ]
interface Notification {
  id: number
  company: string
  label: string
  title: string
  description: string
  timestamp: string
  isUnread: boolean
  avatar: string
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
      async function fetchNotifications() {
        try {
          const storedUser = localStorage.getItem("user")
          const userId = storedUser ? JSON.parse(storedUser).id : null
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_FIREBASE_API_URL}/auth/notifications/${userId}`
          )
          const data = await res.json()

          // if your API returns an array like [{ userId, messages: [...] }]
          const formatted = data[0]?.messages?.map((msg: any, index: number) => ({
            id: index + 1,
            company: msg.company,
            label: msg.label,
            title: msg.title,
            description: msg.description,
            timestamp: msg.timestamp,
            isUnread: msg.isUnread,
            avatar: msg.avatar,
          })) || []

          setNotifications(formatted)
        } catch (error) {
          console.error("Error fetching notifications:", error)
        }
      }

      fetchNotifications()
    }, [])
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <JobHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6"
        onClick={() => router.back()}>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-6 py-2 rounded-full transition-colors">
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#12372B]">Recent Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-xl p-6 hover:shadow-md duration-300 transition-shadow cursor-pointer"
              onClick={() => {
                if (notification.label === "Document Request") {
                  router.push('/profile?tab=jobsApplied');
                } else if (notification.label === "New Job Match") {
                  // Extract job ID from description
                  const jobIdMatch = notification.description.match(/jobId: ([a-f0-9]+)/);
                  if (jobIdMatch && jobIdMatch[1]) {
                    const jobId = jobIdMatch[1];
                    router.push(`/jobs/details?id=${jobId}`);
                  } else {
                    router.push('/jobs');
                  }
                }
              }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center">
                    <span className="text-[#32343A] font-semibold text-lg">{notification.avatar}</span>
                  </div>
                </div>

                {/* Content */}
                <div className=" min-w-0">
                  {/* Header with company name, label badge and unread indicator */}
                  <div className="flex items-center justify-between -mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{notification.company}</h3>
                    </div>
                    {notification.isUnread && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>

               
                  <span className="inline-flex items-center  text-xs font-medium text-[#A1A1A1] rounded">
                        {notification.label}
                      </span>
                         {/* Title */}
                  <div className="my-3">
                    <h4 className="text-base font-semibold text-gray-900">{notification.title}</h4>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-[#32343A] leading-relaxed">{notification.description}</p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center text-xs text-[#888888]">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{notification.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}