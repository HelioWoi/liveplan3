import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, Bell, Calendar, ChevronRight, ArrowUpCircle, ArrowDownCircle, PlusCircle, Download, TrendingUp, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
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

export function InvestmentsPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBrokersModal, setShowBrokersModal] = useState(false);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [marketNews, setMarketNews] = useState<any[]>([]);

  // Filter investment transactions
  const investments = transactions.filter(t => t.category === 'Investimento');

  // Calculate total invested
  const totalInvested = investments.reduce((sum, t) => sum + t.amount, 0);

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
      {/* Header */}
      <div className="bg-[#120B39] text-white">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
          <div className="relative px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">Investment Portfolio</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
        {/* Watchlist */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Market Watch</h2>
            <button
              onClick={() => setShowBrokersModal(true)}
              className="btn btn-primary"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Open Trading Account
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <div key={quote.symbol} className="bg-gray-50 rounded-xl p-4">
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

        {/* Market News */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-bold mb-6">Market News</h2>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <a
                key={index}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50 rounded-lg p-4 transition-colors"
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
                      {format(new Date(news.datetime * 1000), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center flex-wrap">
            {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={classNames(
                  'px-4 py-1 rounded-full text-sm font-medium border',
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
                    'px-3 py-1 rounded-md text-sm border',
                    selectedMonth === month ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
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
                    'px-3 py-1 rounded-md text-sm border',
                    selectedYear === year ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalInvested)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returns</p>
                <p className="text-2xl font-bold text-success-600">+12.5%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="text-2xl font-bold text-accent-600">{formatCurrency(totalInvested * 0.01)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Investments */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Investments</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Investment
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {investments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No investments recorded</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary mt-4"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Make Your First Investment
                </button>
              </div>
            ) : (
              investments.map(investment => (
                <div key={investment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{investment.origin}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(investment.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(investment.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
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
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BROKERS.map((broker) => (
                  <a
                    key={broker.name}
                    href={broker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-bold mb-2">{broker.name}</h3>
                    <p className="text-gray-600 mb-4">{broker.description}</p>
                    <div className="flex items-center text-primary-600">
                      <span className="font-medium">Open Account</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
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
      </div>

      <BottomNavigation />
    </div>
  );
}