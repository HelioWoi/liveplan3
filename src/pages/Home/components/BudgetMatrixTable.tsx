import { HelpCircle } from "lucide-react";

import Tooltip from "./Tooltip";
import { formatCurrency } from "../../../utils/formatters";
import { CATEGORY_DESCRIPTIONS } from "../../../constants";


type Props = {
  // data: Record<string, any>;
  data: Record<string, { [week: number]: { id: string | null; amount: number; week: number; category: string } }>; 
  activeWeek: number;
};

const weeks = [1, 2, 3, 4];
const textGreen = ['Income', 'Balance'];

export function BudgetMatrixTable({ data, activeWeek }: Props) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {weeks.map((week) => (
                <th
                    key={week}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                      ${week === activeWeek ? 'bg-purple-50' : 'bg-gray-50'}`}
                >
                    WEEK {week}
                </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(data).map(([category, values]) => {
              return (
                <tr key={category} className={category === 'Balance' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {category}

                      {category !== 'Balance' &&
                        <Tooltip content={CATEGORY_DESCRIPTIONS[category] || ''}>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                        </Tooltip>
                      }
                      
                    </div>
                  </td>

                  {weeks.map((week) => {
                    const isCurrentWeek = week === activeWeek;

                    return (
                    <td
                      data-id={values[week].id || ''}
                      data-category={values[week].category}
                      data-week={values[week].week}
                      data-amount={values[week].amount}
                      key={week}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${isCurrentWeek ? 'bg-purple-50' : ''}`}
                    >
                      <div
                        className={`text-gray-500 
                          ${values[week].amount < 1 ? '' : 'hover:bg-gray-100'}
                          ${!textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-yellow-600' : ''}
                          ${textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-green-600' : ''}
                          ${values[week].category === 'Balance' && values[week].amount < 0 ? 'mb-1 p-1 rounded cursor-pointer text-red-600' : ''}
                        `}
                      >
                        {formatCurrency(values[week].amount)}
                      </div>
                    </td>
                  )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
