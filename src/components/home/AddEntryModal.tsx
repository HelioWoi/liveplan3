import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: string;
  selectedYear?: number;
}

export default function AddEntryModal({ isOpen, onClose, selectedMonth = 'April', selectedYear }: AddEntryModalProps) {
  const { currentYear } = useWeeklyBudgetStore();
  const [month, setMonth] = useState(selectedMonth);
  const [week, setWeek] = useState('Week 1');
  const [category, setCategory] = useState('Extra');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const { addEntry } = useWeeklyBudgetStore();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!description || isNaN(numericAmount)) {
      return;
    }

    addEntry({
      id: Date.now().toString(),
      week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
      description,
      amount: numericAmount,
      category,
      month: month,
      year: selectedYear || currentYear,
    });

    // Reset form
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
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
                <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
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
                        <option key={m} value={m}>
                          {m}
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
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900"
                      />
                    </div>
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
  );
}
