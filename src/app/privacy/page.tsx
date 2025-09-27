"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#163A33] mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Last updated: January 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Personal Information:</strong> When you create an account, we collect your name, email address, 
                  professional credentials, work experience, and contact information.
                </p>
                <p>
                  <strong>Professional Data:</strong> We collect information about your skills, certifications, 
                  project history, and professional references to facilitate better matching.
                </p>
                <p>
                  <strong>Usage Data:</strong> We automatically collect information about how you use our platform, 
                  including pages visited, time spent, and interactions with our services.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and improve our AI-powered matching services</li>
                  <li>To verify your professional credentials and qualifications</li>
                  <li>To connect you with relevant projects and opportunities</li>
                  <li>To communicate with you about platform updates and opportunities</li>
                  <li>To ensure platform security and prevent fraud</li>
                  <li>To comply with legal obligations and industry regulations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With potential employers or project partners (with your consent)</li>
                  <li>With service providers who assist in platform operations</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In case of business transfers or mergers</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>End-to-end encryption for sensitive data transmission</li>
                  <li>Secure data storage with regular backups</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular security audits and updates</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">5. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">6. Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and provide personalized content. You can manage cookie preferences in your browser settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">7. International Transfers</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">8. Children's Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly 
                  collect personal information from children under 18.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">8. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">9. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@projectmatch.com</p>
                  <p><strong>Address:</strong> Compscope Technology Solutions</p>
                  <p>123 Energy Plaza, Houston, TX 77001</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
