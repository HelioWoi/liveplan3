import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-8">
          <Link
            to="/signup"
            className="inline-flex items-center text-sm text-[#1A1A40] hover:text-[#2A2A50] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to signup
          </Link>
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-[#1A1A40] mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Effective Date: May 6, 2025</p>

          <p className="text-gray-700 mb-6">
            LivePlan³ is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">1. Information We Collect</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name and email address during account creation</li>
                <li>Financial data you enter (e.g., income, expenses)</li>
                <li>Optional feedback or support messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">2. How We Use Your Data</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide and improve our services</li>
                <li>To communicate with you (e.g., emails or notifications)</li>
                <li>To analyze usage for internal improvements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">3. Data Security</h2>
              <p className="text-gray-700">
                We use secure encryption and industry-standard practices to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">4. Sharing of Information</h2>
              <p className="text-gray-700">
                We never sell your data. We only share it with trusted service providers when necessary for operation, or if required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">5. Your Rights</h2>
              <p className="text-gray-700">
                You can access, edit, or delete your data at any time through your account settings. You can also request data export or removal by emailing us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We may use minimal tracking tools (e.g., analytics) to improve the user experience. No financial data is tracked for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">7. Changes to this Policy</h2>
              <p className="text-gray-700">
                We may update this policy from time to time. Continued use of the app means you accept any changes.
              </p>
            </section>
          </div>

          <hr className="my-8 border-gray-200" />

          <p className="text-gray-700">
            If you have questions or requests, contact us at{' '}
            <a
              href="mailto:support@liveplan3.com"
              className="text-[#1A1A40] hover:text-[#2A2A50] underline"
            >
              support@liveplan3.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
