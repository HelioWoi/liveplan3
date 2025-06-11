import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { PageHeader } from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { ChevronDown, ChevronUp, Download, Eye, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FiscalYearData {
  year: number;
  transactions: number;
  income: number;
  expenses: number;
  savings: number;
  archived: boolean;
  quarters: {
    quarter: number;
    transactions: number;
    income: number;
    expenses: number;
  }[];
}

const FiscalYears: React.FC = () => {
  const navigate = useNavigate();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  
  // Mock data for archived fiscal years
  // In a real application, this would come from an API or service
  const fiscalYearsData: FiscalYearData[] = [
    {
      year: 2025,
      transactions: 342,
      income: 48750,
      expenses: 36420,
      savings: 12330,
      archived: true,
      quarters: [
        { quarter: 1, transactions: 87, income: 12200, expenses: 9105 },
        { quarter: 2, transactions: 92, income: 12350, expenses: 9215 },
        { quarter: 3, transactions: 78, income: 12100, expenses: 8950 },
        { quarter: 4, transactions: 85, income: 12100, expenses: 9150 }
      ]
    },
    {
      year: 2024,
      transactions: 298,
      income: 45200,
      expenses: 38600,
      savings: 6600,
      archived: true,
      quarters: [
        { quarter: 1, transactions: 72, income: 11050, expenses: 9600 },
        { quarter: 2, transactions: 68, income: 11250, expenses: 9700 },
        { quarter: 3, transactions: 81, income: 11400, expenses: 9650 },
        { quarter: 4, transactions: 77, income: 11500, expenses: 9650 }
      ]
    },
    {
      year: 2023,
      transactions: 265,
      income: 42800,
      expenses: 37900,
      savings: 4900,
      archived: true,
      quarters: [
        { quarter: 1, transactions: 65, income: 10500, expenses: 9400 },
        { quarter: 2, transactions: 63, income: 10700, expenses: 9500 },
        { quarter: 3, transactions: 72, income: 10800, expenses: 9600 },
        { quarter: 4, transactions: 65, income: 10800, expenses: 9400 }
      ]
    }
  ];

  const toggleExpandYear = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetails = (year: number) => {
    // Generate PDF for the fiscal year
    const fiscalYear = fiscalYearsData.find(fy => fy.year === year);
    if (!fiscalYear) return;
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Fiscal Year ${year} Report`, 20, 20);
    
    // Add summary information
    doc.setFontSize(12);
    doc.text(`Total Transactions: ${fiscalYear.transactions}`, 20, 40);
    doc.text(`Total Income: ${formatCurrency(fiscalYear.income)}`, 20, 50);
    doc.text(`Total Expenses: ${formatCurrency(fiscalYear.expenses)}`, 20, 60);
    doc.text(`Total Savings: ${formatCurrency(fiscalYear.savings)}`, 20, 70);
    
    // Add quarterly data
    doc.setFontSize(16);
    doc.text('Quarterly Breakdown', 20, 90);
    
    doc.setFontSize(10);
    // Table headers
    doc.text('Quarter', 20, 100);
    doc.text('Transactions', 60, 100);
    doc.text('Income', 100, 100);
    doc.text('Expenses', 140, 100);
    doc.text('Savings', 180, 100);
    
    // Table data
    fiscalYear.quarters.forEach((quarter, index) => {
      const y = 110 + (index * 10);
      doc.text(`Q${quarter.quarter}`, 20, y);
      doc.text(`${quarter.transactions}`, 60, y);
      doc.text(`${formatCurrency(quarter.income)}`, 100, y);
      doc.text(`${formatCurrency(quarter.expenses)}`, 140, y);
      doc.text(`${formatCurrency(quarter.income - quarter.expenses)}`, 180, y);
    });
    
    // Save the PDF
    doc.save(`fiscal-year-${year}-report.pdf`);
  };

  const handleExportData = (year: number) => {
    // In a real application, this would trigger an export of the fiscal year data
    console.log(`Export data for year ${year}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title="Archived Fiscal Years" />
      
      <div className="max-w-4xl mx-auto pb-24 px-4 pt-6">
        <div className="mb-6">
          <p className="text-gray-600">
            View and access your archived fiscal year data. Archived data is removed from your main dashboard but preserved for reference and reporting.
          </p>
        </div>
        
        <div className="space-y-4">
          {fiscalYearsData.map((fiscalYear) => (
            <div 
              key={fiscalYear.year}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Year Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpandYear(fiscalYear.year)}
              >
                <div className="flex items-center">
                  <FileBarChart className="h-5 w-5 text-primary-600 mr-2" />
                  <div>
                    <h3 className="font-medium">Fiscal Year {fiscalYear.year}</h3>
                    <p className="text-sm text-gray-500">
                      {fiscalYear.transactions} transactions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="hidden sm:block mr-6">
                    <div className="flex space-x-6">
                      <div>
                        <p className="text-xs text-gray-500">Income</p>
                        <p className="font-medium text-green-600">{formatCurrency(fiscalYear.income)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="font-medium text-red-600">{formatCurrency(fiscalYear.expenses)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Savings</p>
                        <p className="font-medium">{formatCurrency(fiscalYear.savings)}</p>
                      </div>
                    </div>
                  </div>
                  {expandedYear === fiscalYear.year ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedYear === fiscalYear.year && (
                <div className="border-t border-gray-200">
                  {/* Quarterly Data */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {fiscalYear.quarters.map((quarter) => (
                          <tr key={quarter.quarter} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">Q{quarter.quarter}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{quarter.transactions}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-green-600">{formatCurrency(quarter.income)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-red-600">{formatCurrency(quarter.expenses)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(quarter.income - quarter.expenses)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewDetails(fiscalYear.year)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportData(fiscalYear.year)}
                      className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-sm leading-5 font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {fiscalYearsData.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileBarChart className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No archived fiscal years</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't archived any fiscal years yet.
            </p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Profile
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default FiscalYears;
