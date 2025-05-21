import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, PlusCircle, TrendingUp, ExternalLink } from 'lucide-react';
import classNames from 'classnames';

import { useTransactionStore } from '../stores/transactionStore';
import { Transaction } from '../types/transaction';
import InvestmentRegistrationModal from '../components/modals/InvestmentRegistrationModal';
import InvestmentDetailsModal from '../components/modals/InvestmentDetailsModal';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
// Importações de componentes de layout

// Replace direct Finnhub client with a fetch-based approach
const API_KEY = 'd08rfs1r01qju5m8a010d08rfs1r01qju5m8a01g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Função temporariamente modificada para retornar dados mockados em vez de fazer chamadas de API
async function fetchQuote(symbol: string) {
  console.log(`Usando dados mockados para ${symbol} em vez de chamar a API`);
  // Retornar dados mockados para evitar erros
  return {
    c: Math.random() * 200 + 100, // current price
    d: Math.random() * 10 - 5,    // change
    dp: Math.random() * 5 - 2.5,  // percent change
    h: Math.random() * 220 + 100, // high price of the day
    l: Math.random() * 180 + 100, // low price of the day
    o: Math.random() * 200 + 100, // open price of the day
    pc: Math.random() * 200 + 100 // previous close price
  };
}

async function fetchMarketNews() {
  // Buscar notícias específicas de finanças e mercado
  const response = await fetch(
    `${FINNHUB_BASE_URL}/news?category=business&minId=10&token=${API_KEY}`
  );
  const data = await response.json();
  
  // Filtrar e formatar as notícias
  return data
    .filter((item: any) => 
      item.category === 'business' && 
      item.headline && 
      item.summary && 
      item.url
    )
    .map((item: any) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary.slice(0, 120) + '...',  // Limitar tamanho do resumo
      url: item.url,
      source: item.source,
      datetime: new Date(item.datetime * 1000)
    }))
    .sort((a: any, b: any) => b.datetime.getTime() - a.datetime.getTime())  // Ordenar por data
    .slice(0, 3);  // Pegar as 3 mais recentes
}

// Tipos para o seletor de meses e anos
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

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
  const [activeInvestments, setActiveInvestments] = useState(0);
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useTransactionStore();
  const [selectedMonth, setSelectedMonth] = useState<Month>('April');
  const [selectedYear, setSelectedYear] = useState('2025');

  const [showBrokersModal, setShowBrokersModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Transaction | null>(null);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<Array<{
    id: string;
    headline: string;
    summary: string;
    url: string;
    source: string;
    datetime: Date;
  }>>([]);

  // Filter investment transactions
  const investments = transactions.filter((t: any) => t.category === 'Investment');

  // Calculate total invested
  const totalInvested = investments.reduce((sum: number, t: any) => sum + t.amount, 0);

  // Commented out unused code
  // Group investments by type
  /*
  const investmentsByType = investments.reduce((acc: Record<string, number>, inv: any) => {
    const type = inv.description.split('|').reduce((acc: string, line: string) => {
      const [key, value] = line.split(':');
      if (key?.trim() === 'Type') {
        return value?.trim() || 'Other';
      }
      return acc;
    }, 'Other');

    if (!acc[type]) {
      acc[type] = 0;
    }

    acc[type] += inv.amount;
    return acc;
  }, {});
  */

  // Calculate active investments
  useEffect(() => {
    const active = investments.filter((inv: any) => {
      const details = inv.description?.split('\n').reduce((acc: Record<string, string>, line: string) => {
        const match = line.match(/- (.*?): (.*)/);
        if (match) {
          acc[match[1].toLowerCase()] = match[2];
        }
        return acc;
      }, {} as Record<string, string>) || {};
      return details.status !== 'closed';
    }).length;
    setActiveInvestments(active);
  }, [investments]);

  // Fetch market news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await fetchMarketNews();
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching market news:', error);
        setNews([]);
      }
    };

    fetchNews();
    
    // Atualizar notícias a cada 5 minutos
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch stock quotes
    const fetchQuotes = async () => {
      try {
        const quotesData = await Promise.all(
          WATCHLIST_SYMBOLS.map(async (symbol) => {
            try {
              const quote = await fetchQuote(symbol);
              if (!quote || typeof quote.c !== 'number') {
                throw new Error('Invalid quote data');
              }
              return {
                symbol,
                price: quote.c,
                change: quote.d || 0,
                percentChange: quote.dp || 0
              };
            } catch (err) {
              console.error(`Error fetching quote for ${symbol}:`, err);
              return {
                symbol,
                price: 0,
                change: 0,
                percentChange: 0
              };
            }
          })
        );
        setQuotes(quotesData.filter(q => q.price > 0));
      } catch (error) {
        console.error('Error fetching quotes:', error);
        setQuotes([]);
      }
    };

    fetchQuotes();

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
              <button
                onClick={() => setShowInvestmentModal(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <PlusCircle className="h-6 w-6" />
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
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                    quote.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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

        {/* Recent Investments */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Investments</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as Month)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {['2022', '2023', '2024', '2025'].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {investments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No investments found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {investments.map((investment: any) => (
                <div
                  key={investment.id}
                  className="flex items-center justify-between py-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer px-4 -mx-4 rounded-lg transition-all duration-200 hover:shadow-sm"
                  onClick={() => setSelectedInvestment(investment)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{investment.origin}</p>
                      <p className="text-gray-500">
                        {format(new Date(investment.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(investment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Investment */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Registered Investment</h2>
            <button
              onClick={() => setShowInvestmentModal(true)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500">Total Invested</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">Investments</p>
                <p className="text-2xl font-bold">{investments.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">Active</p>
                <p className="text-2xl font-bold">{activeInvestments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Market News */}
        <div className="bg-white rounded-xl p-6 shadow-card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Market News</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBrokersModal(true)}
                className="inline-flex items-center px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Broker
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{item.headline}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.summary}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{item.source}</span>
                      <span className="mx-2">•</span>
                      <span>{format(item.datetime, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1 transform transition-transform group-hover:translate-x-0.5 group-hover:scale-110" />
                  <span className="sr-only">Open news in new tab</span>
                </div>
              </a>
            ))}
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
                    <div className="flex items-center text-purple-600">
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

      {/* Investment Registration Modal */}
      <InvestmentRegistrationModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
      />

      {/* Investment Details Modal */}
      {selectedInvestment && (
        <InvestmentDetailsModal
          isOpen={true}
          onClose={() => setSelectedInvestment(null)}
          onDelete={deleteTransaction}
          investment={selectedInvestment}
        />
      )}
    </div>
  );
}