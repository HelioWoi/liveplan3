import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  useWeeklyBudgetStore,
  WeeklyBudgetEntry,
} from "../../stores/weeklyBudgetStore";
import { TransactionCategory } from "../../types/transaction";
import { useAuthStore } from "../../stores/authStore";
import { useCreateWeeklyBudget } from "../../hooks/useCreateWeeklyBudget";

import { getDateFromYearMonthWeek } from "../../pages/Home/components/helper/getDateFromYearMonthWeek";
import { monthMap } from "../../constants";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear?: number;
}

const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
const categories = ["Income", "Fixed", "Variable", "Extra", "Additional"];

const repeatOptions = [
  "Does not repeat",
  "Daily",
  "Weekly",
  "Monthly",
  "Annually",
  "Every weekday",
];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const monthlyWeeks = ["First", "Second", "Third", "Fourth", "Last"];

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

type WeekLabel = "1" | "2" | "3" | "4";

function getWeekOfMonth(date: Date): WeekLabel {
  const day = date.getDate();
  if (day <= 7) return "1";
  if (day <= 14) return "2";
  if (day <= 21) return "3";
  return "4";
}

function getWeeksInMonth(year: number, monthIndex: number): WeekLabel[] {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const weeks: WeekLabel[] = [];
  if (lastDay > 0) weeks.push("1");
  if (lastDay > 7) weeks.push("2");
  if (lastDay > 14) weeks.push("3");
  if (lastDay > 21) weeks.push("4");
  return weeks;
}

function generateWeeklyEntriesFromNowToEndOfYear(baseEntry: any): any {
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  const currentWeek = getWeekOfMonth(today);

  const entries: { month: string; week: WeekLabel }[] = [];

  // Mês atual: apenas semanas restantes (incluindo a atual)
  const weeksThisMonth = getWeeksInMonth(currentYear, currentMonthIndex);
  const currentWeekIndex = weeksThisMonth.indexOf(currentWeek);
  for (let i = currentWeekIndex; i < weeksThisMonth.length; i++) {
    entries.push({
      ...baseEntry,
      user_id: baseEntry.id,
      id: uuidv4(),
      month: months[currentMonthIndex].short,
      week: weeksThisMonth[i],
    });
  }

  // Próximos meses até dezembro: todas as semanas do mês
  for (let m = currentMonthIndex + 1; m < 12; m++) {
    const weeks = getWeeksInMonth(currentYear, m);
    for (const week of weeks) {
      entries.push({
        ...baseEntry,
        user_id: baseEntry.id,
        id: uuidv4(),
        month: months[m].short,
        week,
      });
    }
  }

  return entries;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  selectedYear,
}: AddEntryModalProps) {
  const { mutate: createBudget } = useCreateWeeklyBudget();
  const { addEntry, insertMultipleEntries } = useWeeklyBudgetStore();
  const [month, setMonth] = useState("Jan");
  const [week, setWeek] = useState("Week 1");
  const [category, setCategory] = useState("Income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [syncToTransactions, setSyncToTransactions] = useState(true);
  const [repeatOption, setRepeatOption] = useState("Does not repeat");
  const [weeklyDay, setWeeklyDay] = useState("Monday");
  const [monthlyWeek, setMonthlyWeek] = useState("First");
  const [monthlyDay, setMonthlyDay] = useState("Monday");
  const [annualDate, setAnnualDate] = useState("");

  const user_id = useAuthStore((state) => state.user?.id)?.toString() || "";

  // Função para gerar entradas recorrentes com base na opção selecionada
  const generateRecurringEntries = async (baseEntry: WeeklyBudgetEntry) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const futureEntries: WeeklyBudgetEntry[] = [];

    // Determinar quantas entradas futuras gerar com base na opção de repetição
    switch (repeatOption) {
      case "Daily":
        // Gerar entradas para os próximos 30 dias
        for (let i = 1; i <= 30; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);

          const futureMonth = futureDate.toLocaleString("default", {
            month: "long",
          });
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();

          // Determinar a semana com base no dia do mês
          let futureWeek = "Week 1";
          if (dayOfMonth > 21) {
            futureWeek = "Week 4";
          } else if (dayOfMonth > 14) {
            futureWeek = "Week 3";
          } else if (dayOfMonth > 7) {
            futureWeek = "Week 2";
          }

          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-daily-${i}`,
            week: futureWeek as "Week 1" | "Week 2" | "Week 3" | "Week 4",
            month: futureMonth,
            year: futureYear,
          });
        }
        break;

      case "Weekly":
        // Gerar entradas para as próximas 12 semanas
        for (let i = 1; i <= 12; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i * 7);

          const futureMonth = futureDate.toLocaleString("default", {
            month: "long",
          });
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();

          // Determinar a semana com base no dia do mês
          let futureWeek = "Week 1";
          if (dayOfMonth > 21) {
            futureWeek = "Week 4";
          } else if (dayOfMonth > 14) {
            futureWeek = "Week 3";
          } else if (dayOfMonth > 7) {
            futureWeek = "Week 2";
          }

          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-weekly-${i}`,
            week: futureWeek as "Week 1" | "Week 2" | "Week 3" | "Week 4",
            month: futureMonth,
            year: futureYear,
          });
        }
        break;

      case "Monthly":
        // Gerar entradas para os próximos 12 meses
        for (let i = 1; i <= 12; i++) {
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + i);

          const futureMonth = futureDate.toLocaleString("default", {
            month: "long",
          });
          const futureYear = futureDate.getFullYear();

          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-monthly-${i}`,
            month: futureMonth,
            year: futureYear,
          });
        }
        break;

      case "Annually":
        // Gerar entradas para os próximos 5 anos
        for (let i = 1; i <= 5; i++) {
          const futureYear = currentYear + i;

          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-annual-${i}`,
            year: futureYear,
          });
        }
        break;

      case "Every weekday":
        // Gerar entradas para os próximos 30 dias úteis (seg-sex)
        /*
        let daysAdded = 0;
        let dayCounter = 1;
        
        while (daysAdded < 30) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + dayCounter);
          dayCounter++;
          
          // Verificar se é dia útil (1-5 são seg-sex, 0 e 6 são dom e sáb)
          const dayOfWeek = futureDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          
          daysAdded++;
          
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();
          
          // Determinar a semana com base no dia do mês
          let futureWeek = 'Week 1';
          if (dayOfMonth > 21) {
            futureWeek = 'Week 4';
          } else if (dayOfMonth > 14) {
            futureWeek = 'Week 3';
          } else if (dayOfMonth > 7) {
            futureWeek = 'Week 2';
          }
          const now = new Date();
          const currentMonth = months[now.getMonth()]["short"];

          futureEntries.push({
            ...baseEntry,
            week: futureWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
            month: currentMonth,
            year: futureYear
          });
          
        }
        */
        const weeklyEntriesFromCurrentWeek =
          generateWeeklyEntriesFromNowToEndOfYear(baseEntry);
        futureEntries.push(...weeklyEntriesFromCurrentWeek);

        break;
    }

    // Adicionar todas as entradas futuras geradas
    const response = await insertMultipleEntries(futureEntries);

    console.log(`Entradas recorrentes geradas:`, response, futureEntries);

    return futureEntries;
  };

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

    // Se a opção de repetição for diferente de 'Does not repeat', gerar entradas futuras
    if (repeatOption !== "Does not repeat") {
      await generateRecurringEntries(entry);

      setDescription("");
      setAmount("");
      onClose();

      return;
    }

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
        date,
        user_id: id,
      },
    ];

    // Adiciona a entrada ao orçamento semanal
    // addEntry(entry);
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

                  {/* Weekly Options - Show when Weekly is selected */}
                  {repeatOption === "Weekly" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of week
                      </label>
                      <select
                        value={weeklyDay}
                        onChange={(e) => setWeeklyDay(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {weekDays.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Monthly Options - Show when Monthly is selected */}
                  {repeatOption === "Monthly" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Week of month
                        </label>
                        <select
                          value={monthlyWeek}
                          onChange={(e) => setMonthlyWeek(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                        >
                          {monthlyWeeks.map((week) => (
                            <option key={week} value={week}>
                              {week}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of week
                        </label>
                        <select
                          value={monthlyDay}
                          onChange={(e) => setMonthlyDay(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                        >
                          {weekDays.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

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
                      onChange={(e) => setSyncToTransactions(e.target.checked)}
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
  );
}
