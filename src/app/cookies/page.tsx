"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Last updated: January 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">1. What Are Cookies?</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">2. How We Use Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  ProjectMATCH uses cookies for several important purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To keep you logged in and maintain your session</li>
                  <li>To remember your preferences and settings</li>
                  <li>To improve our platform's performance and functionality</li>
                  <li>To analyze how users interact with our services</li>
                  <li>To provide personalized content and recommendations</li>
                  <li>To ensure platform security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#163A33] mb-3">Essential Cookies</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are necessary for the Platform to function properly. They cannot be disabled.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Authentication and login cookies</li>
                    <li>Security and fraud prevention cookies</li>
                    <li>Load balancing and performance cookies</li>
                    <li>Session management cookies</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#163A33] mb-3">Functional Cookies</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies enhance your experience by remembering your preferences and settings.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Language and region preferences</li>
                    <li>Display settings and themes</li>
                    <li>Notification preferences</li>
                    <li>Search history and filters</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#163A33] mb-3">Analytics Cookies</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies help us understand how you use our Platform to improve our services.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Page views and navigation patterns</li>
                    <li>Feature usage and engagement metrics</li>
                    <li>Performance and loading times</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#163A33] mb-3">Marketing Cookies</h3>
                  <p className="text-gray-700 mb-3">
                    These cookies help us deliver relevant content and measure the effectiveness of our marketing.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Ad targeting and personalization</li>
                    <li>Campaign performance tracking</li>
                    <li>Social media integration</li>
                    <li>Email marketing preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">4. Third-Party Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>LinkedIn:</strong> For professional networking and authentication</li>
                  <li><strong>Payment Processors:</strong> For secure payment processing</li>
                  <li><strong>Cloud Services:</strong> For data storage and platform infrastructure</li>
                </ul>
                <p>
                  These third parties have their own privacy policies and cookie practices. We recommend 
                  reviewing their policies for more information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">5. Managing Your Cookie Preferences</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  You have several options for managing cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to control cookies through their settings</li>
                  <li><strong>Cookie Banner:</strong> Use our cookie consent banner to choose your preferences</li>
                  <li><strong>Opt-Out Tools:</strong> Use industry-standard opt-out mechanisms for advertising cookies</li>
                  <li><strong>Account Settings:</strong> Adjust your preferences in your ProjectMATCH account</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">6. Browser-Specific Instructions</h2>
              <div className="space-y-4 text-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Chrome</h4>
                    <p className="text-sm">Settings → Privacy and Security → Cookies and other site data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Firefox</h4>
                    <p className="text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Safari</h4>
                    <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Edge</h4>
                    <p className="text-sm">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">7. Impact of Disabling Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you choose to disable cookies, please note that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Some features may not work properly</li>
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Personalized content may not be available</li>
                  <li>Some security features may be compromised</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">8. Cookie Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Different types of cookies are retained for different periods:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
                  <li><strong>Authentication Cookies:</strong> Usually expire after 30 days of inactivity</li>
                  <li><strong>Analytics Cookies:</strong> Typically retained for 24 months</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">9. Updates to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons. We will notify you of any material 
                  changes by posting the updated policy on our website.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">10. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
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
