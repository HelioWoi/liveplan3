

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

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 text-center z-10">
        {content}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Formula³ – 50/30/20</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          A healthy distribution of your budget:
          <span className="block mt-2 text-xs text-gray-500">
            • 50% for essential needs
            • 30% for flexible spending
            • 20% to build your future
          </span>
        </p>
      </div>

      <div className="space-y-6">
        {/* Fixed Expenses */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <Tooltip content="Essential and recurring expenses such as rent, utilities, basic food, transportation, and other monthly fixed bills.">
              <span className="font-medium text-gray-700 cursor-help border-b border-dotted border-gray-400">Fixed Expenses (50%)</span>
            </Tooltip>
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
          <div className="flex justify-between text-xs mt-1">
            <div>
              {data.fixed.percentage > 50 ? (
                <span className="text-red-600">
                  ↑ {(data.fixed.percentage - 50).toFixed(1)}% above target
                </span>
              ) : data.fixed.percentage < 50 ? (
                <span className="text-blue-600">
                  ↓ {(50 - data.fixed.percentage).toFixed(1)}% below target
                </span>
              ) : (
                <span className="text-green-600">✓ Ideal distribution</span>
              )}
            </div>
            <div className="flex">
              <span className={`font-medium ${getTextColor('fixed', data.fixed.percentage)}`}>
                {data.fixed.percentage.toFixed(1)}% (current)
              </span>
              <span className="mx-1 text-gray-500">/</span>
              <span className="text-gray-500">50% (target)</span>
            </div>
          </div>
        </div>

        {/* Variable Expenses */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <Tooltip content="Flexible and adjustable expenses such as entertainment, dining out, non-essential shopping, subscriptions, and other expenses that can be reduced if needed.">
              <span className="font-medium text-gray-700 cursor-help border-b border-dotted border-gray-400">Variable Expenses (30%)</span>
            </Tooltip>
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
          <div className="flex justify-between text-xs mt-1">
            <div>
              {data.variable.percentage > 30 ? (
                <span className="text-red-600">
                  ↑ {(data.variable.percentage - 30).toFixed(1)}% above target
                </span>
              ) : data.variable.percentage < 30 ? (
                <span className="text-blue-600">
                  ↓ {(30 - data.variable.percentage).toFixed(1)}% below target
                </span>
              ) : (
                <span className="text-green-600">✓ Ideal distribution</span>
              )}
            </div>
            <div className="flex">
              <span className={`font-medium ${getTextColor('variable', data.variable.percentage)}`}>
                {data.variable.percentage.toFixed(1)}% (current)
              </span>
              <span className="mx-1 text-gray-500">/</span>
              <span className="text-gray-500">30% (target)</span>
            </div>
          </div>
        </div>

        {/* Investments */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <Tooltip content="Investments for your future: savings, fixed income, stocks, investment funds, retirement, or any way to grow your money.">
              <span className="font-medium text-gray-700 cursor-help border-b border-dotted border-gray-400">Investments (20%)</span>
            </Tooltip>
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
          <div className="flex justify-between text-xs mt-1">
            <div>
              {data.investments.percentage > 20 ? (
                <span className="text-green-600">
                  ↑ {(data.investments.percentage - 20).toFixed(1)}% above target
                </span>
              ) : data.investments.percentage < 20 ? (
                <span className="text-blue-600">
                  ↓ {(20 - data.investments.percentage).toFixed(1)}% below target
                </span>
              ) : (
                <span className="text-green-600">✓ Ideal distribution</span>
              )}
            </div>
            <div className="flex">
              <span className={`font-medium ${getTextColor('investments', data.investments.percentage)}`}>
                {data.investments.percentage.toFixed(1)}% (current)
              </span>
              <span className="mx-1 text-gray-500">/</span>
              <span className="text-gray-500">20% (target)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}