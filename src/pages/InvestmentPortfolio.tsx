import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calculator, Info, TrendingUp, Target, ChevronRight, HeartHandshake, Share2, Download, ChevronLeft } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';

// Replace direct Finnhub client with a fetch-based approach
const API_KEY = 'd08rfs1r01qju5m8a010d08rfs1r01qju5m8a01g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

async function fetchQuote(symbol: string) {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
  );
  return response.json();
}

async function fetchMarketNews() {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/news?category=general&token=${API_KEY}`
  );
  return response.json();
}

type Period = 'day' | 'week' | 'month' | 'year';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];

// Market categories with soft colors
const MARKET_CATEGORIES = [
  { name: 'Stocks', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { name: 'Crypto', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
  { name: 'Real Estate', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { name: 'Commodities', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
];

// Popular brokers list
const BROKERS = [
  { name: 'Stake', url: 'https://stake.com.au', description: 'Trade US stocks and ETFs' },
  { name: 'SelfWealth', url: 'https://www.selfwealth.com.au', description: 'Australian share trading platform' },
  { name: 'CommSec', url: 'https://www.commsec.com.au', description: 'Commonwealth Bank trading platform' },
  { name: 'eToro', url: 'https://www.etoro.com/en-au', description: 'Social trading and investment platform' },
];

// Watchlist stocks
const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
}

export default function InvestmentPortfolio() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showBrokersModal, setShowBrokersModal] = useState(false);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [marketNews, setMarketNews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stock quotes
    const fetchQuotes = async () => {
      try {
        const quotesData = await Promise.all(
          WATCHLIST_SYMBOLS.map(async (symbol) => {
            const quote = await fetchQuote(symbol);
            return {
              symbol,
              price: quote.c,
              change: quote.d,
              percentChange: quote.dp
            };
          })
        );
        setQuotes(quotesData);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };

    // Fetch market news
    const fetchNews = async () => {
      try {
        const news = await fetchMarketNews();
        setMarketNews(news.slice(0, 5));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchQuotes();
    fetchNews();

    // Refresh quotes every minute
    const interval = setInterval(fetchQuotes, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Investment Portfolio" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Period Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center flex-wrap">
              {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={classNames(
                    'px-4 py-1 rounded-full text-sm font-medium border transition-colors',
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'text-gray-700 border-gray-300 hover:border-purple-300'
                  )}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {selectedPeriod === 'month' && (
              <div className="flex flex-wrap gap-2">
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={classNames(
                      'px-3 py-1 rounded-md text-sm border transition-colors',
                      selectedMonth === month 
                        ? 'bg-purple-500 text-white border-purple-600' 
                        : 'text-gray-700 border-gray-300'
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

            {selectedPeriod === 'year' && (
              <div className="flex flex-wrap gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={classNames(
                      'px-3 py-1 rounded-md text-sm border transition-colors',
                      selectedYear === year 
                        ? 'bg-purple-500 text-white border-purple-600' 
                        : 'text-gray-700 border-gray-300'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Market Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {MARKET_CATEGORIES.map(category => (
            <div 
              key={category.name}
              className={`${category.color} border rounded-xl p-6 shadow-sm transition-transform hover:scale-[1.02]`}
            >
              <h3 className={`text-lg font-semibold ${category.textColor} mb-2`}>
                {category.name}
              </h3>
              <div className="flex justify-between items-center">
                <span className={`${category.textColor}`}>
                  {formatCurrency(Math.random() * 10000)}
                </span>
                <span className="text-success-600 text-sm">
                  +{(Math.random() * 5).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Market News */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-6">Market News</h2>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <a
                key={index}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50 rounded-lg p-4 transition-colors border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  {news.image && (
                    <img
                      src={news.image}
                      alt={news.headline}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{news.headline}</h3>
                    <p className="text-sm text-gray-500">{news.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(news.datetime * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Market Watch</h2>
            <button
              onClick={() => setShowBrokersModal(true)}
              className="btn btn-primary"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Open Trading Account
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <div key={quote.symbol} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{quote.symbol}</h3>
                  <span className={classNames(
                    "text-sm font-medium px-2 py-1 rounded-full",
                    quote.change >= 0 ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
                  )}>
                    {quote.change >= 0 ? '+' : ''}{quote.percentChange.toFixed(2)}%
                  </span>
                </div>
                <p className="text-2xl font-bold">${quote.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} today
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="btn btn-primary flex-1">
            <TrendingUp className="h-5 w-5 mr-2" />
            Add Investment
          </button>
          <button className="btn btn-outline flex-1">
            <Target className="h-5 w-5 mr-2" />
            Make Investment
          </button>
        </div>
      </div>

      {/* Brokers Modal */}
      {showBrokersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Choose Your Trading Platform</h2>
              <button
                onClick={() => setShowBrokersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BROKERS.map((broker) => (
                <a
                  key={broker.name}
                  href={broker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-2">{broker.name}</h3>
                  <p className="text-gray-600 mb-4">{broker.description}</p>
                  <div className="flex items-center text-primary-600">
                    <span className="font-medium">Open Account</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </div>
                </a>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Note: LivePlan³ is not affiliated with any of these platforms. Please research and compare before choosing a broker.
            </p>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}