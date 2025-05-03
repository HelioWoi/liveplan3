import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { format } from 'date-fns';
import { Download, Filter, PlusCircle, FileText, Calendar, DollarSign, TrendingUp, X, HelpCircle } from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';

interface NewInvoice {
  number: string;
  clientId: string;
  amount: string;
  description: string;
  dueDate: string;
  taxRate: string;
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    number: `INV-${selectedYear}-001`,
    clientId: '',
    amount: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    taxRate: '10',
  });

  // Available years for selection
  const years = ['2024', '2025'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Filter invoices from transactions
  const invoices = transactions.filter(t => t.category === 'Invoices');

  // Calculate summary statistics
  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalPaid: invoices.filter(inv => new Date(inv.date) <= new Date()).reduce((sum, inv) => sum + inv.amount, 0),
    totalPending: invoices.filter(inv => new Date(inv.date) > new Date()).reduce((sum, inv) => sum + inv.amount, 0),
    totalOverdue: 0 // Calculate based on due dates if needed
  };

  // Calculate tax summary for the year
  const yearlyTaxSummary = {
    totalAmount: stats.totalInvoiced,
    totalTax: stats.totalInvoiced * 0.1 // Assuming 10% tax rate
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewInvoiceModal(false);
    setNewInvoice({
      number: `INV-${selectedYear}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientId: '',
      amount: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      taxRate: '10',
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Implementation for downloading invoice
    console.log('Downloading invoice:', invoiceId);
  };

  const handleNewClient = () => {
    setShowNewClientModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Invoices" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Period Selection */}
        <div className="bg-white rounded-xl p-4 shadow-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                className="input w-full"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select 
                className="input w-full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Invoiced</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalInvoiced)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-xl font-bold text-success-600">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-warning-600">{formatCurrency(stats.totalPending)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-xl font-bold text-error-600">{formatCurrency(stats.totalOverdue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Invoice
            </button>
            <button 
              onClick={handleNewClient}
              className="btn btn-outline flex-1 sm:flex-none"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Client
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="btn btn-outline"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="input">
                <option value="">All Clients</option>
              </select>

              <select className="input">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>

              <input type="date" className="input" placeholder="Start Date" />
              <input type="date" className="input" placeholder="End Date" />
            </div>
          </div>
        )}

        {/* Tax Summary */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tax Summary ({selectedYear})</h2>
            <button
              onClick={() => navigate('/tax')}
              className="btn btn-outline flex items-center gap-2"
            >
              <HelpCircle className="h-5 w-5" />
              Learn about Tax
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(yearlyTaxSummary.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tax (10%)</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(yearlyTaxSummary.totalTax)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Income</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(yearlyTaxSummary.totalAmount - yearlyTaxSummary.totalTax)}
              </p>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        INV-{format(new Date(invoice.date), 'yyyyMM')}-{invoice.id.slice(0, 3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.origin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No invoices found</p>
              <button 
                onClick={() => setShowNewInvoiceModal(true)}
                className="btn btn-primary"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Your First Invoice
              </button>
            </div>
          )}
        </div>

        {/* New Invoice Modal */}
        {showNewInvoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create New Invoice</h2>
                <button
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitInvoice} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Invoice Number</label>
                    <input
                      type="text"
                      className="input"
                      value={newInvoice.number}
                      onChange={(e) => setNewInvoice({...newInvoice, number: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Client</label>
                    <select 
                      className="input"
                      value={newInvoice.clientId}
                      onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                      required
                    >
                      <option value="">Select Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="text"
                        className="input pl-8"
                        placeholder="0.00"
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Due Date</label>
                    <input
                      type="date"
                      className="input"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="label">Tax Rate (%)</label>
                      <button
                        type="button"
                        onClick={() => navigate('/tax')}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Learn about Tax
                      </button>
                    </div>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      max="100"
                      value={newInvoice.taxRate}
                      onChange={(e) => setNewInvoice({...newInvoice, taxRate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Describe the services or products..."
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    Create Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewInvoiceModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Client Modal */}
        {showNewClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Add New Client</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Client Name</label>
                  <input type="text" className="input" placeholder="Full Name" />
                </div>
                
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" className="input" placeholder="Company (Optional)" />
                </div>
                
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="email@example.com" />
                </div>
                
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="Phone Number" />
                </div>
                
                <div>
                  <label className="label">Address</label>
                  <textarea className="input" rows={3} placeholder="Full Address"></textarea>
                </div>

                <div className="flex gap-3">
                  <button className="btn btn-primary flex-1">Add Client</button>
                  <button 
                    onClick={() => setShowNewClientModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BottomNavigation onAddClick={() => setShowNewInvoiceModal(true)} />
      </div>
    </div>
  );
}