import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTransactionStore } from "../stores/transactionStore";
import { format } from "date-fns";
import {
  Download,
  FilterX,
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import TransactionModal from "../components/modals/TransactionModal";
import BottomNavigation from "../components/layout/BottomNavigation";

import PeriodButton from "../components/common/PeriodButton";
import { TransactionCategory, isIncomeCategory } from "../types/transaction";
import { formatCurrency } from "../utils/formatters";

export default function Transactions() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    TransactionCategory | "all"
  >("all");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "Day" | "Week" | "Month" | "Year"
  >("Month");
  const [selectedMonth, setSelectedMonth] = useState<string>("April");
  const [showMonths, setShowMonths] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = (transaction.origin || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || transaction.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Date", "Origin", "Amount", "Category"];
    const csvContent = [
      headers.join(","),
      ...sortedTransactions.map((t) =>
        [
          format(new Date(t.date), "yyyy-MM-dd"),
          `"${(t.origin || "").replace(/"/g, '""')}"`,
          t.amount,
          t.category,
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = "text-xs font-medium px-3 py-1.5 rounded-full";
    switch (category) {
      case "Fixed":
        return `${baseClass} bg-[#EAE6FE] text-[#5B3FFB]`;
      case "Variable":
        return `${baseClass} bg-[#EAE6FE] text-[#5B3FFB]`;
      case "Income":
        return `${baseClass} bg-[#E6FAF5] text-[#00B087]`;
      case "Investment":
        return `${baseClass} bg-[#E6FAF5] text-[#00B087]`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-[#120B39] pb-24">
      <div className="px-4 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <button className="text-white">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      <div className="px-4 space-y-6">
        <div className="flex gap-4">
          <button
            className="flex-1 bg-[#5B3FFB] text-white rounded-xl py-4 font-medium flex items-center justify-center"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New
          </button>
          <button
            className="flex-1 bg-white text-gray-900 rounded-xl py-4 font-medium flex items-center justify-center"
            onClick={exportToCSV}
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-3xl p-4">
          <div className="flex gap-2">
            {["Day", "Week", "Month", "Year"].map((period) => (
              <PeriodButton
                key={period}
                onClick={() => {
                  setSelectedPeriod(
                    period as "Day" | "Week" | "Month" | "Year"
                  );
                  if (period === "Month") {
                    setShowMonths(true);
                  } else {
                    setShowMonths(false);
                  }
                }}
                isActive={selectedPeriod === period}
              >
                {period}
              </PeriodButton>
            ))}
          </div>

          {showMonths && (
            <div className="flex overflow-x-auto gap-2 mt-4 pb-2">
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <PeriodButton
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  isActive={selectedMonth === month}
                >
                  {month}
                </PeriodButton>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="mt-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-50 rounded-2xl py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5B3FFB] focus:ring-opacity-50"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <select
              className="w-full bg-gray-50 rounded-2xl py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B3FFB] focus:ring-opacity-50"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as TransactionCategory | "all")
              }
            >
              <option value="all">All Categories</option>
              <option value="Income">Income</option>
              <option value="Investment">Investment</option>
              <option value="Fixed">Fixed</option>
              <option value="Variable">Variable</option>
              <option value="Extra">Extra</option>
              <option value="Additional">Additional</option>
              <option value="Tax">Tax</option>
            </select>
          </div>

          {(searchTerm || categoryFilter !== "all") && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {sortedTransactions.length} of {transactions.length}{" "}
                transactions
              </p>
              <button
                className="text-sm text-[#5B3FFB] hover:text-[#4935E8] flex items-center transition-colors"
                onClick={clearFilters}
              >
                <FilterX className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-3xl overflow-hidden">
          {sortedTransactions.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 px-6 py-4 text-sm font-medium text-gray-500 uppercase">
                <div>Date</div>
                <div>Origin</div>
                <div className="flex justify-between pr-4">
                  <div>Category</div>
                  <div>Amount</div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedTransactions
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-3 px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="text-gray-900">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </div>
                      <div className="text-gray-900">
                        {transaction.origin || ""}
                      </div>
                      <div className="flex items-center justify-between">
                        {transaction.category === "Tax" ? (
                          <Link
                            to="/tax"
                            className={`${getCategoryBadgeClass(
                              transaction.category
                            )} cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            {transaction.category}
                          </Link>
                        ) : (
                          <span
                            className={getCategoryBadgeClass(
                              transaction.category
                            )}
                          >
                            {transaction.category}
                          </span>
                        )}
                        {transaction.amount && (
                          <span
                            className={
                              isIncomeCategory(transaction.category)
                                ? "text-success-600 font-medium"
                                : "text-error-600 font-medium"
                            }
                          >
                            {isIncomeCategory(transaction.category) ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {/* Pagination */}
              {sortedTransactions.length > itemsPerPage && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of{" "}
                    {Math.ceil(sortedTransactions.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(sortedTransactions.length / itemsPerPage),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(sortedTransactions.length / itemsPerPage)
                    }
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">No transactions found</p>
              <button
                className="bg-[#5B3FFB] text-white rounded-xl py-4 px-6 font-medium flex items-center justify-center mx-auto hover:bg-[#4935E8] transition-colors"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <BottomNavigation />
      </div>
    </div>
  );
}
