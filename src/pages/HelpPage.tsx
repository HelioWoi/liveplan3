import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Calculator, Target, DollarSign, PiggyBank, ArrowUpCircle, Upload } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';

interface TaxBracket {
  min: number;
  max: number | '∞';
  rate: number;
}

const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18201, max: 45000, rate: 19 },
  { min: 45001, max: 120000, rate: 32.5 },
  { min: 120001, max: 180000, rate: 37 },
  { min: 180001, max: '∞', rate: 45 },
];

interface Category {
  name: string;
  color: string;
  icon: JSX.Element;
  description: string;
  percentage?: number;
}

const CATEGORIES: Category[] = [
  {
    name: 'Income',
    color: 'bg-success-100 text-success-600',
    icon: <ArrowUpCircle className="h-6 w-6" />,
    description: 'Revenue you receive from any source, such as salaries, freelance work, or commissions.',
  },
  {
    name: 'Investments',
    color: 'bg-primary-100 text-primary-600',
    icon: <PiggyBank className="h-6 w-6" />,
    description: 'Money you set aside for financial investments with future returns. These values are entered as "planned income" but are not available for immediate spending.',
  },
  {
    name: 'Fixed',
    color: 'bg-blue-100 text-blue-600',
    icon: <DollarSign className="h-6 w-6" />,
    description: 'Mandatory and recurring expenses, such as rent, school, health insurance, etc.',
    percentage: 50,
  },
  {
    name: 'Variable',
    color: 'bg-orange-100 text-orange-600',
    icon: <Calculator className="h-6 w-6" />,
    description: 'Flexible and monthly expenses, such as groceries, fuel, delivery.',
    percentage: 30,
  },
  {
    name: 'Extra',
    color: 'bg-red-100 text-red-600',
    icon: <Target className="h-6 w-6" />,
    description: 'Non-standard costs, such as unexpected repairs or last-minute travel. Should be used with caution.',
  },
  {
    name: 'Additional',
    color: 'bg-purple-100 text-purple-600',
    icon: <Target className="h-6 w-6" />,
    description: 'Non-essential expenses that you chose to make, such as gifts or parties. Ideally, these should be planned.',
  },
  {
    name: 'Tax',
    color: 'bg-gray-100 text-gray-600',
    icon: <Calculator className="h-6 w-6" />,
    description: 'Tax reserves (such as Australian Tax Return). Helps understand how much should be saved and allows you to simulate potential refunds.',
  },
];

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('categories');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Help & Support" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h1 className="text-2xl font-bold mb-2">LivePlan³</h1>
          <p className="text-gray-600">
            Everything you need to know to use your app with clarity, purpose, and peace of mind.
          </p>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('categories')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">What are Categories?</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'categories' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'categories' && (
            <div className="px-6 pb-6">
              <div className="grid gap-4">
                {CATEGORIES.map((category) => (
                  <div key={category.name} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center flex-shrink-0`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {category.name}
                        {category.percentage && (
                          <span className="text-sm font-normal text-gray-500">
                            ({category.percentage}%)
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formula Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('formula')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">What is Formula³ – 50/30/20?</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'formula' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'formula' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                The 50/30/20 formula divides your budget intelligently:
              </p>
              
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-2">50% for Fixed Expenses</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-2">30% for Variable Expenses</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold mb-2">20% for Investments</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-gray-600">
                The progress bar helps you maintain real-time control and alerts you when you exceed any ideal limit.
              </p>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('goals')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">What are Goals?</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'goals' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'goals' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                These are personalized financial objectives, such as "Buy a PlayStation" or "Travel to Japan". 
                You set the amount, deadline, and track your progress.
              </p>
              <p className="text-gray-600">
                Goals can also be associated with retirement planning or passive investments.
              </p>
            </div>
          )}
        </div>

        {/* Tax Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('tax')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">About Tax (Australia)</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'tax' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'tax' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                You can easily simulate how much you should set aside for taxes based on Australian income brackets:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Income Range</th>
                      <th className="px-4 py-2 text-right">Tax (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAX_BRACKETS.map((bracket, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-4 py-2">
                          ${bracket.min.toLocaleString()} - {bracket.max === '∞' ? '+' : `$${bracket.max.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-2 text-right">{bracket.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-gray-600">
                The Tax page shows how much has been paid, how much is remaining, and how much you might be saving or overpaying.
              </p>
            </div>
          )}
        </div>

        {/* Spreadsheet Upload Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('spreadsheet')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">Upload My Own Spreadsheet</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'spreadsheet' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'spreadsheet' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                You can upload your own transaction spreadsheet to automatically import data into LivePlan³. 
                Just follow these simple steps:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li className="text-gray-600">Download our spreadsheet template or use your own format</li>
                <li className="text-gray-600">Fill it with your transactions (date, amount, category, description)</li>
                <li className="text-gray-600">Save as a CSV, XLS, or XLSX file</li>
                <li className="text-gray-600">Upload using the button below</li>
              </ol>

              <button 
                onClick={() => {
                  // Create a hidden file input element
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.csv,.xlsx,.xls';
                  fileInput.style.display = 'none';
                  
                  // Add event listener for when a file is selected
                  fileInput.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) {
                      // Navigate to dashboard with the file
                      window.location.href = '/dashboard?openUpload=true';
                    }
                  });
                  
                  // Append to body, click to open file dialog, then remove
                  document.body.appendChild(fileInput);
                  fileInput.click();
                  setTimeout(() => {
                    document.body.removeChild(fileInput);
                  }, 1000);
                }} 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Upload Spreadsheet
              </button>
            </div>
          )}
        </div>

        {/* Expert Help Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('expert')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">Need help from an expert?</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'expert' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'expert' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                We have partner professionals available to answer questions about:
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                  <span>Tax Return (Australia)</span>
                </li>
                <li className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary-600" />
                  <span>Investments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary-600" />
                  <span>Financial Organization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-600" />
                  <span>Retirement and Passive Income Planning</span>
                </li>
              </ul>

              <button className="btn btn-primary w-full">
                Talk to an Expert
              </button>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <button
            className="w-full px-6 py-4 flex items-center justify-between"
            onClick={() => toggleSection('feedback')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">Send your Feedback</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${
              expandedSection === 'feedback' ? 'rotate-180' : ''
            }`} />
          </button>

          {expandedSection === 'feedback' && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                Your opinion helps us improve LivePlan³! 📩 Send suggestions, ideas, or report any issues you've found in the app.
              </p>

              <button className="btn btn-primary w-full">
                Send Feedback
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}