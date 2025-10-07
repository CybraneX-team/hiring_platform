"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Last updated: January 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using ProjectMATCH ("the Platform"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  ProjectMATCH is an AI-powered platform that connects verified professionals with projects in the 
                  energy and infrastructure sectors. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Professional profile creation and verification</li>
                  <li>AI-powered talent and project matching</li>
                  <li>Secure project management and communication tools</li>
                  <li>Industry-specific compliance and certification tracking</li>
                  <li>Payment processing and milestone tracking</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  To access certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">4. Professional Standards</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  As a professional platform, all users must maintain high standards of conduct:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate professional credentials and experience</li>
                  <li>Maintain confidentiality of sensitive project information</li>
                  <li>Comply with all applicable industry regulations and standards</li>
                  <li>Act professionally in all communications and interactions</li>
                  <li>Report any safety concerns or violations immediately</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">5. Prohibited Activities</h2>
              <div className="space-y-4 text-gray-700">
                <p>You may not use the Platform to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to the Platform</li>
                  <li>Interfere with the proper functioning of the Platform</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">6. Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Platform and its original content, features, and functionality are owned by Compscope and are 
                  protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p>
                  You retain ownership of your professional content but grant us a license to use it for Platform 
                  operations and matching services.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">7. Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Payment terms vary by service type and are specified in individual project agreements. 
                  General payment principles include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Secure payment processing through verified channels</li>
                  <li>Milestone-based payments for project work</li>
                  <li>Transparent fee structure with no hidden costs</li>
                  <li>Dispute resolution procedures for payment issues</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">8. Disclaimers</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Platform is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Continuous availability of the Platform</li>
                  <li>Accuracy of all user-provided information</li>
                  <li>Successful project outcomes or matches</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">9. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  To the maximum extent permitted by law, Compscope shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                  or business opportunities.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">10. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we 
                  believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p>
                  You may terminate your account at any time by contacting our support team.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">11. Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of Texas, 
                  without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">12. Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any material 
                  changes via email or through the Platform. Continued use constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#163A33] mb-4">13. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Phone:</strong> +91 7318546574</p>
                  <p><strong>Email:</strong> Support@compscope.in</p>
                  <p><strong>Address:</strong> KHA NO. 310, PLOT NO. - 60, GANESHPUR, RAHMANPUR CHINHAT, LUCKNOW, 226028</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
