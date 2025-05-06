import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-[#1A1A40] mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-6">Effective Date: May 6, 2025</p>

          <p className="text-gray-700 mb-6">
            Welcome to LivePlan³! By using our app and services, you agree to be bound by the following terms and conditions. Please read them carefully.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">1. Use of the Service</h2>
              <p className="text-gray-700">
                LivePlan³ is a financial planning and budgeting application. You must be at least 16 years old to use our services. You agree not to misuse the app or attempt unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">2. Account Creation</h2>
              <p className="text-gray-700">
                You are responsible for maintaining the security of your account credentials. All information provided must be accurate and up to date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">3. Data and Privacy</h2>
              <p className="text-gray-700">
                Your financial data is stored securely and will not be shared with third parties without your consent, except as required by law. For details, see our{' '}
                <Link to="/privacy-policy" className="text-[#1A1A40] hover:text-[#2A2A50] underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">4. Availability</h2>
              <p className="text-gray-700">
                We strive to maintain uptime, but we do not guarantee the app will be available at all times. We reserve the right to modify or discontinue features without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">5. Termination</h2>
              <p className="text-gray-700">
                You may delete your account at any time. We may suspend or terminate your account for violations of these terms or suspicious activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                We are not responsible for any financial losses or decisions made based on your use of the app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1A1A40] mb-4">7. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms of Service periodically. Continued use after changes means you accept the new terms.
              </p>
            </section>
          </div>

          <hr className="my-8 border-gray-200" />

          <p className="text-gray-700">
            If you have any questions, contact us at{' '}
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
