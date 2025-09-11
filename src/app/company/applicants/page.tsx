"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MapPin, Clock, CheckCircle, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toJpeg } from "html-to-image"
import jsPDF from "jspdf"

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform rotate-360" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} stroke="#E5E7EB" strokeWidth="3" fill="none" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="#76FF82"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-semibold text-sm">{percentage}%</span>
      </div>
    </div>
  )
}

const mockApplicantDetail = {
  id: "1",
  name: "Miller Rich",
  title: "Mechanical Engineer",
  avatar: "MR",
  available: true,
  location: "USA, Michigan",
  experience: "5 Years",
  matchPercentage: 81,
  skills: ["UI Development", "AI Prompting", "ML Ops", "Adobe Suite", "Wireframing"],
  certifications: ["Site Management"],
  experience_details: [
    {
      title: "Managing Director",
      company: "Business Inc",
      description: [
        "Providing strategic advice to the board and ensuring effective functioning.",
        "Preparing comprehensive business plans and overseeing their implementation.",
      ],
    },
    {
      title: "Junior Developer",
      company: "Company Name",
      description: [
        "Quality Assurance Tester to contribute to the testing efforts for our critical regulatory reporting applications.",
        "Reporting to the Quality Assurance Team Lead, you will play a key role in ensuring the accuracy.",
      ],
    },
  ],
  academics: [
    {
      level: "Masters",
      institution: "University of Michigan",
      completed: true,
    },
    {
      level: "Graduation",
      institution: "University of Michigan",
      completed: true,
    },
    {
      level: "Highschool",
      institution: "Great school of Michigan",
      completed: true,
    },
  ],
  languages: ["English (Native)", "German (Intermediate)", "Hindi (Fresh)"],
  contact: {
    phone: "+91 00000 00000",
    email: "soabcc@gmail.com",
  },
  documents: {
    photo: "/images/hero.png",
    certificates: ["/images/hero.png", "/images/hero.png"],
    marksheets: ["/images/hero.png", "/images/hero.png"],
    identificationDocs: ["/images/hero.png", "/images/hero.png"],
  },
}

export default function ApplicationDetailView() {
  const applicant = mockApplicantDetail
  const router = useRouter()

  const [isShortlisted, setIsShortlisted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const brandName = "Compscope"
  const brandInitial = brandName.charAt(0)
  const [preparingPdf, setPreparingPdf] = useState(false)

  const handleShortlist = () => {
    setIsShortlisted((prev) => !prev)
  }

  const handleDownload = async () => {
    if (!contentRef.current) return

    setPreparingPdf(true)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    try {
      console.log("[v0] Starting consolidated PDF generation...")

      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const node = contentRef.current
      const rect = node.getBoundingClientRect()

      console.log("[v0] Generating CV page...")
      const cvDataUrl = await toJpeg(node, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (n: HTMLElement) => {
          const hasAttr = typeof n.getAttribute === "function"
          const ignore =
            hasAttr &&
            (n.getAttribute("data-html2canvas-ignore") === "true" || n.getAttribute("data-pdf-hide") === "true")
          return !ignore
        },
      })

      const imgWidth = pageWidth
      const imgHeight = (rect.height * imgWidth) / rect.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(cvDataUrl, "JPEG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(cvDataUrl, "JPEG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const addDocumentToPdf = async (imageUrl: string, title: string) => {
        try {
          console.log(`[v0] Adding document: ${title} from ${imageUrl}`)

          return new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = "anonymous"

            img.onload = () => {
              try {
                console.log(`[v0] Successfully loaded image for: ${title}`)
                pdf.addPage()

                pdf.setFontSize(16)
                pdf.setFont("helvetica", "bold")
                pdf.text(title, 20, 20)

                const maxWidth = pageWidth - 40
                const maxHeight = pageHeight - 40

                let docWidth = maxWidth
                let docHeight = (img.height * docWidth) / img.width

                if (docHeight > maxHeight) {
                  docHeight = maxHeight
                  docWidth = (img.width * docHeight) / img.height
                }

                const xPos = (pageWidth - docWidth) / 2
                const yPos = 30

                pdf.addImage(img, "JPEG", xPos, yPos, docWidth, docHeight)
                console.log(`[v0] Successfully added ${title} to PDF`)
                resolve()
              } catch (error) {
                console.error(`[v0] Error processing image for ${title}:`, error)
                resolve()
              }
            }

            img.onerror = (error) => {
              console.warn(`[v0] Failed to load image: ${imageUrl}`, error)
              resolve()
            }

            setTimeout(() => {
              console.warn(`[v0] Timeout loading image: ${imageUrl}`)
              resolve()
            }, 10000)

            img.src = imageUrl
          })
        } catch (error) {
          console.warn(`[v0] Error adding document ${title}:`, error)
        }
      }

      console.log("[v0] Documents to add:", applicant.documents)

      if (applicant.documents.photo) {
        console.log("[v0] Adding candidate photo...")
        await addDocumentToPdf(applicant.documents.photo, "Candidate Photo")
      }

      console.log(`[v0] Adding ${applicant.documents.certificates.length} certificates...`)
      for (let i = 0; i < applicant.documents.certificates.length; i++) {
        await addDocumentToPdf(applicant.documents.certificates[i], `Certificate ${i + 1}`)
      }

      console.log(`[v0] Adding ${applicant.documents.marksheets.length} marksheets...`)
      for (let i = 0; i < applicant.documents.marksheets.length; i++) {
        await addDocumentToPdf(applicant.documents.marksheets[i], `Marksheet ${i + 1}`)
      }

      console.log(`[v0] Adding ${applicant.documents.identificationDocs.length} ID documents...`)
      for (let i = 0; i < applicant.documents.identificationDocs.length; i++) {
        await addDocumentToPdf(applicant.documents.identificationDocs[i], `ID Document ${i + 1}`)
      }

      console.log("[v0] Saving consolidated PDF...")
      pdf.save(`${applicant.name.replace(/\s+/g, "-")}-Consolidated-Profile.pdf`)
      console.log("[v0] PDF generation completed successfully!")
    } catch (error) {
      console.error("[v0] Error generating consolidated PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setPreparingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="sr-only" aria-live="polite">
        {isShortlisted ? "Shortlisted" : ""}
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Compscope</h1>
      <div className="max-w-6xl mx-auto mt-12">
        <div className="mb-10 flex items-center justify-between">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div className="flex items-center gap-3" data-html2canvas-ignore="true">
            <motion.button
              type="button"
              onClick={handleShortlist}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82]"
              aria-pressed={isShortlisted}
            >
              <AnimatePresence initial={false} mode="wait">
                {!isShortlisted ? (
                  <motion.span
                    key="label-shortlist"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    Shortlist
                  </motion.span>
                ) : (
                  <motion.span
                    key="label-shortlisted"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      type: "spring",
                      stiffness: 650,
                      damping: 18,
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 650,
                        damping: 18,
                      }}
                      className="inline-flex"
                    >
                      <CheckCircle className="w-4 h-4" color="#000000" />
                    </motion.span>
                    <span>Shortlisted</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={preparingPdf}
              className="px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium inline-flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#76FF82] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {preparingPdf ? "Preparing..." : "Download "}
            </motion.button>
          </div>
        </div>

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">{applicant.avatar}</span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">{applicant.name}</h2>
                <p className="text-gray-600">{applicant.title}</p>
              </div>
            </div>

            <div className="relative w-12 h-12">
              {!preparingPdf && (
                <div data-pdf-hide="true">
                  <CircularProgress percentage={applicant.matchPercentage} />
                </div>
              )}
              {preparingPdf && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {brandInitial}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 font-medium">Available</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{applicant.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{applicant.experience}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Certifications from Industry</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.certifications.map((cert, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applicant.experience_details.map((exp, index) => (
                <div key={index} className="bg-[#F5F5F5] rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{exp.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{exp.company}</p>
                  <div className="space-y-2">
                    {exp.description.map((desc, descIndex) => (
                      <p key={descIndex} className="text-sm text-gray-700 leading-relaxed">
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academics</h3>
              <div className="space-y-4">
                {applicant.academics.map((academic, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#76FF82] flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">{academic.level}</p>
                      <p className="text-sm text-gray-600">{academic.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
              <div className="space-y-2">
                {applicant.languages.map((language, index) => (
                  <p key={index} className="text-gray-700">
                    {language}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Phone No :</span> {applicant.contact.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Mail :</span> {applicant.contact.email}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
