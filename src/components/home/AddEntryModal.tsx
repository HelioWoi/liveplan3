import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { WeeklyBudgetEntry } from "../../stores/weeklyBudgetStore";
import { TransactionCategory } from "../../types/transaction";
import { useAuthStore } from "../../stores/authStore";
import {
  useCreateBudgetWithRecurrence,
  useCreateWeeklyBudget,
} from "../../hooks/useCreateWeeklyBudget";

import { getDateFromYearMonthWeek } from "../../pages/helper/getDateFromYearMonthWeek";
import { monthMap } from "../../constants";
import { FullScreenLoader } from "../common/FullScreenLoader";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear?: number;
}

const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
const categories = ["Income", "Fixed", "Variable", "Extra", "Additional"];

const repeatOptions = ["Does not repeat", "Weekly", "Monthly", "Annually"];

const months = [
  { full: "January", short: "Jan" },
  { full: "February", short: "Feb" },
  { full: "March", short: "Mar" },
  { full: "April", short: "Apr" },
  { full: "May", short: "May" },
  { full: "June", short: "Jun" },
  { full: "July", short: "Jul" },
  { full: "August", short: "Aug" },
  { full: "September", short: "Sep" },
  { full: "October", short: "Oct" },
  { full: "November", short: "Nov" },
  { full: "December", short: "Dec" },
];

export default function AddEntryModal({
  isOpen,
  onClose,
  selectedYear,
}: AddEntryModalProps) {
  const { mutate: createBudget } = useCreateWeeklyBudget();
  const { mutate: createBudgetWithRecurrence, isPending } =
    useCreateBudgetWithRecurrence();

  const [month, setMonth] = useState("Jan");
  const [week, setWeek] = useState("Week 1");
  const [category, setCategory] = useState("Income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [syncToTransactions, setSyncToTransactions] = useState(true);
  const [repeatOption, setRepeatOption] = useState("Does not repeat");
  const [annualDate, setAnnualDate] = useState("");

  const user_id = useAuthStore((state) => state.user?.id)?.toString() || "";

  const handleSubmit = async () => {
    if (!description || !amount) {
      return;
    }

    const entry: WeeklyBudgetEntry = {
      id: user_id,
      description,
      amount: parseFloat(amount),
      category: category as TransactionCategory,
      week: week.replace(/[^\d.-]+/g, "") as any,
      month: months.find((m) => m.short === month)?.short || month,
      year: selectedYear || new Date().getFullYear(),
    };

    const { id, ...rest } = entry;

    const budgetData = {
      ...rest,
      user_id: id,
    } as any;

    const monthNumber = monthMap[rest.month as keyof typeof monthMap];
    const date = getDateFromYearMonthWeek(
      rest.year,
      monthNumber,
      Number(rest.week)
    );

    const transactionsData = [
      {
        origin: rest.category,
        description: rest.description,
        amount: rest.amount,
        category: rest.category,
        type: rest.category.toLowerCase(),
        date:
          repeatOption === "Annually"
            ? new Date(annualDate).toISOString()
            : date,
        user_id: id,
      },
    ] as any;

    // Se a opção de repetição for diferente de 'Does not repeat', gerar entradas futuras
    if (repeatOption !== "Does not repeat") {
      createBudgetWithRecurrence({
        budgetData,
        transactionsData,
        recurrence: repeatOption as any,
      });

      setDescription("");
      setAmount("");
      onClose();

      return;
    }

    // Adiciona a entrada ao orçamento semanal
    createBudget({
      budgetData,
      transactionsData,
    });

    // Reset form
    setDescription("");
    setAmount("");
    onClose();
  };

  return (
    <>
      {isPending && <FullScreenLoader />}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 mb-6"
                  >
                    Add New Entry
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Month Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {months.map((m) => (
                          <option key={m.full} value={m.short}>
                            {m.full}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Week Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Week
                      </label>
                      <select
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {weeks.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      />
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Repeat Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat
                      </label>
                      <select
                        value={repeatOption}
                        onChange={(e) => setRepeatOption(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {repeatOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Annual Options - Show when Annually is selected */}
                    {repeatOption === "Annually" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={annualDate}
                          onChange={(e) => setAnnualDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="syncTransactions"
                        checked={syncToTransactions}
                        onChange={(e) =>
                          setSyncToTransactions(e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="syncTransactions"
                        className="ml-2 block text-sm text-gray-600"
                      >
                        Also add as a transaction (will appear in Expenses page)
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    >
                      Add Entry
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
