import { useMemo } from 'react';

interface Formula3Data {
  fixed: {
    current: number;
    target: number;
    percentage: number;
  };
  variable: {
    current: number;
    target: number;
    percentage: number;
  };
  investments: {
    current: number;
    target: number;
    percentage: number;
  };
}

interface Props {
  data: Formula3Data;
}

export default function Formula3({ data }: Props) {
  const getProgressBarColor = (type: keyof Formula3Data, percentage: number) => {
    const thresholds = {
      fixed: { red: 16.6, yellow: 33.2, green: 50 },
      variable: { red: 10, yellow: 20, green: 30 },
      investments: { red: 6.6, yellow: 13.2, green: 20 }
    };

    const { red, yellow, green } = thresholds[type];
    
    if (percentage <= red) return 'bg-[#EF4444]';
    if (percentage <= yellow) return 'bg-[#F59E0B]';
    return 'bg-[#34D399]';
  };

  const getTextColor = (type: keyof Formula3Data, percentage: number) => {
    const thresholds = {
      fixed: { red: 16.6, yellow: 33.2, green: 50 },
      variable: { red: 10, yellow: 20, green: 30 },
      investments: { red: 6.6, yellow: 13.2, green: 20 }
    };

    const { red, yellow, green } = thresholds[type];
    
    if (percentage <= red) return 'text-[#EF4444]';
    if (percentage <= yellow) return 'text-[#F59E0B]';
    return 'text-[#34D399]';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Formula³ – 50/30/20</h2>
        <p className="text-sm text-gray-500">Track your financial distribution</p>
      </div>

      <div className="space-y-6">
        {/* Fixed Expenses */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Fixed Expenses (50%)</span>
            <span className="text-gray-900">
              ${data.fixed.current.toLocaleString()} of ${data.fixed.target.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor('fixed', data.fixed.percentage)} transition-all duration-300`}
              style={{ width: `${Math.min(data.fixed.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-end text-xs mt-1">
            <span className={`font-medium ${getTextColor('fixed', data.fixed.percentage)}`}>
              {data.fixed.percentage.toFixed(1)}% (current)
            </span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-gray-500">50% (ideal)</span>
          </div>
        </div>

        {/* Variable Expenses */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Variable Expenses (30%)</span>
            <span className="text-gray-900">
              ${data.variable.current.toLocaleString()} of ${data.variable.target.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor('variable', data.variable.percentage)} transition-all duration-300`}
              style={{ width: `${Math.min(data.variable.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-end text-xs mt-1">
            <span className={`font-medium ${getTextColor('variable', data.variable.percentage)}`}>
              {data.variable.percentage.toFixed(1)}% (current)
            </span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-gray-500">30% (ideal)</span>
          </div>
        </div>

        {/* Investments */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Investments (20%)</span>
            <span className="text-gray-900">
              ${data.investments.current.toLocaleString()} of ${data.investments.target.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor('investments', data.investments.percentage)} transition-all duration-300`}
              style={{ width: `${Math.min(data.investments.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-end text-xs mt-1">
            <span className={`font-medium ${getTextColor('investments', data.investments.percentage)}`}>
              {data.investments.percentage.toFixed(1)}% (current)
            </span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-gray-500">20% (ideal)</span>
          </div>
        </div>
      </div>
    </div>
  );
}