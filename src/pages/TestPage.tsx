// Página de teste para diagnóstico

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, the React application is rendering correctly.
        </p>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-800">
            This is a diagnostic page to help troubleshoot rendering issues.
          </p>
        </div>
      </div>
    </div>
  );
}
