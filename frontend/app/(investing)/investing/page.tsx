'use client'

import { useEffect, useState } from 'react';
import StockChart from '@/components/finance/StockChart';
import StockList from '@/components/finance/StockList';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Stock } from '@/components/finance/StockList';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Holdings = {
  ticker: string;
  quantity: number;
  average_price: number;
  current_price: number;
  name: string;
}

export default function InvestingPage() {
  const [chartData, setChartData] = useState([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [buyingPower, setBuyingPower] = useState<number | undefined>(undefined);
  const [currentHolding, setCurrentHolding] = useState(0);
  const [dateRange, setDateRange] = useState('1d');
  const [chartLoading, setChartLoading] = useState(true);
  const { user } = useUser();

  if (!user) {
    const path = '/';
    redirect(path);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/investing/${user?.id}?dateRange=${dateRange}`);
        const data = await response.json();

        if (response.ok) {
          // Map plot_points to chartData format
          const formattedChartData = data.plot_points.map((point: { date: string, total_value: number }) => ({
            date: point.date,
            price: point.total_value,
          }));

          // Set chart data for the StockChart component
          setChartData(formattedChartData);

          // Set the total value of current holdings
          setCurrentHolding(data.total_investing.toFixed(2));
          setBuyingPower(data.buying_power.toFixed(2));

          // Map backend data to Stock[]
          const formattedStocks: Stock[] = data.holdings.map((holding: Holdings) => ({
            ticker: holding.ticker,
            quantity: holding.quantity,
            averagePrice: holding.average_price,
            currentPrice: holding.current_price,
            name: holding.name
          }));

          setStocks(formattedStocks);
          setChartLoading(false);
        } else {
          console.error('Error fetching data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dateRange]);





  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  return (
    <main className='text-gray-800 dark:text-white w-full max-w-7xl mx-auto'>
      <section className="py-20 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4">

        <div className='w-full flex flex-col gap-8'>
          {!chartLoading ? (
            <StockChart
              chartData={chartData}
              ticketCode={''}
              ticketName={'Investing'}
              currentPrice={currentHolding.toString()}
              onRangeChange={handleDateRangeChange}
            />
          ) : (
            <div className="flex  w-full flex-grow">
              <div className="flex flex-grow w-full min-w-[800px] flex-col gap-4">
                <Skeleton className="h-4 w-full h-12 " />
                <Skeleton className="h-4 w-full h-96" />
              </div>
            </div>
          )}
          <div className='w-full flex flex-col gap-4 border border-gray-600/20 dark:border-zinc-800 p-6 py-8 rounded-lg justify-between
          bg-zinc-50 dark:bg-zinc-800 shadow'>
            <div className='flex flex-row justify-between pb-6 border-b border-gray-600/20 dark:border-gray-600/50'>
              <div className='font-bold text-sm'>Buying power</div>
              <div className='text-2xl font-medium flex flex-row items-center gap-2'>${buyingPower? buyingPower : <Skeleton className='h-6 w-24' /> }</div>
            </div>
            <div className='flex my-4'>
              <Link href="/dashboard" className="text-sm text-muted-foreground ml-auto">
                <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 rounded-full text-lg px-8 py-6 inline-flex items-center justify-center">
                  Deposit Funds
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <StockList stocks={stocks} />
        </div>
      </section>
    </main>
  );
}
