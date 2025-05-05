import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { formatCurrency } from '../../utils/formatters';

export default function WeeklyBudget() {
  const [selectedWeek, setSelectedWeek] = useState<'Week 1' | 'Week 2' | 'Week 3' | 'Week 4'>('Week 1');
  const { entries } = useWeeklyBudgetStore();

  // Função para calcular o total de receitas por semana
  const getWeeklyIncome = (week: string) => {
    return entries
      .filter(entry => entry.week === week && entry.amount > 0)
      .reduce((total, entry) => total + entry.amount, 0);
  };

  // Função para calcular o total de despesas por semana
  const getWeeklyExpenses = (week: string) => {
    return entries
      .filter(entry => entry.week === week && entry.amount < 0)
      .reduce((total, entry) => total + Math.abs(entry.amount), 0);
  };

  // Array de semanas para facilitar o mapeamento
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  return (
    <div>
      {/* Title Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Weekly Budget</h2>
            <p className="text-sm text-gray-500">Track your weekly spending</p>
          </div>
        </div>
      </div>

      {/* Week Selection */}
      <div className="flex gap-2 mb-6">
        {weeks.map(week => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              selectedWeek === week
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                : 'border border-gray-200 text-gray-700 hover:border-purple-200'
            }`}
          >
            {week}
          </button>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          {weeks.map(week => {
            const income = getWeeklyIncome(week);
            const expenses = getWeeklyExpenses(week);
            const balance = income - expenses;
            
            return (
              <div
                key={week}
                className={`p-4 rounded-lg border ${
                  selectedWeek === week ? 'border-purple-200 bg-purple-50' : 'border-gray-100'
                }`}
              >
                <div className="text-sm font-medium text-gray-500 mb-2">{week}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Income</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(income)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Expenses</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(expenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Balance</span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Week Details */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Details for {selectedWeek}</h3>
          <div className="space-y-3">
            {entries
              .filter(entry => entry.week === selectedWeek)
              .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
              .map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{entry.description}</div>
                    <div className="text-sm text-gray-500">{entry.category}</div>
                  </div>
                  <div className={`font-semibold ${
                    entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(entry.amount))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
