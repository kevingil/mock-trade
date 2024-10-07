'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/auth';
import StockChart from '@/components/finance/StockChart';
import StockOrderForm from '@/components/finance/StockOrderForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChartData {
  date: string;
  price: number;
}

type DateRange = {
  code: string;
};

export default function TicketPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ code: '1d' });
  const [ticketName, setTicketName] = useState('');
  const [sharesHolding, setSharesHolding] = useState<number | undefined>(undefined);
  const [totalValue, setTotalValue] = useState<string | undefined>(undefined);
  const [stockCurrentPrice, setStockCurrentPrice] = useState<number | undefined>(undefined);
  const [buyingPower, setBuyingPower] = useState<number | undefined>(undefined);
  const { user, setUser } = useUser();
  const searchParams = useSearchParams();
  const ticker = searchParams.get('ticker');

  useEffect(() => {
    const fetchStockData = async () => {
      if (!ticker || !dateRange.code) return;
      let useQuery = '';
      if (user) {
        useQuery = `&userId=${user.id}`
      }

      try {
        const response = await fetch(
          `http://localhost:5000/get-stock-data?ticketCode=${ticker}&dateRange=${dateRange.code}` + useQuery,
        );
        const data = await response.json();

        if (response.ok) {
          console.log(data);
          const formattedData = data.dates.map((date: string, index: number) => ({
            date: date,
            price: data.closing_prices[index],
            name: data.name,
          }));
          setChartData(formattedData);
          setSharesHolding(data.shares_holding);
          setTotalValue(Number(data.total_value).toFixed(2));
          setStockCurrentPrice(data.closing_prices[data.closing_prices.length - 1].toFixed(2).toString());
          setTicketName(data.name);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [ticker, dateRange]);

  useEffect(() => {
    const fetchBuyingPower = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/balance/${user?.id}`);
        const data = await response.json();

        if (response.ok) {
          setBuyingPower(data.balance);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error fetching buying power:", error);
      }
    };

    fetchBuyingPower();
  }, [user?.id]);

  const handleDateRangeChange = (range: string) => {
    setDateRange({ code: range });
  };

  return (
    <main className="text-gray-800 dark:text-white w-full max-w-7xl mx-auto">
      <section className="py-20 flex flex-row gap-4">
        <div className='w-full flex flex-col gap-4'>
          {chartData.length > 0 ? (
            <StockChart
              chartData={chartData}
              ticketCode={ticker as string}
              ticketName={ticketName}
              currentPrice={stockCurrentPrice ? stockCurrentPrice.toString() : '0.00'}
              onRangeChange={(range) => {
                handleDateRangeChange(range);
              }}
            />
          ) : (
            <div className="flex  w-full flex-grow">
              <div className="flex flex-grow w-full min-w-[800px] flex-col gap-4">
                <Skeleton className="h-4 w-full h-12 " />
                <Skeleton className="h-4 w-full h-96" />
              </div>
            </div>
          )}
          {user?.id &&
            <div className='w-full flex flex-row gap-4 bg-transparent '>
              <div className='w-full flex flex-col gap-4 border border-gray-600/20 dark:border-zinc-800 p-6 py-8 rounded-lg justify-between
          bg-transparent shadow-sm'>
                <div className='flex flex-col justify-between pb-6 border-b border-gray-600/20 dark:border-gray-600/50'>
                  <div className='text-sm'>Your market value</div>
                  <div className='text-xl font-medium flex flex-row items-center gap-2'>${totalValue ? totalValue : <Skeleton className='h-6 w-24' />}</div>
                </div>
                <div>
                  <div className='flex flex-row justify-between'>
                    <div className='text-sm'>Shares holding</div>
                    <div className='text-sm font-medium flex flex-row items-center gap-2'>{sharesHolding ? sharesHolding : <Skeleton className='h-6 w-24' />}</div>
                  </div>
                </div>
              </div>
              <div className='w-full flex flex-col gap-4 border border-gray-600/20 dark:border-zinc-800 p-6 py-8 rounded-lg justify-between
          bg-transparent shadow-sm'>
                <div className='flex flex-col justify-between pb-6 border-b border-gray-600/20 dark:border-gray-600/50'>
                  <div className='text-sm'>Buying power</div>
                  <div className='text-2xl font-medium flex flex-row items-center gap-2'>${buyingPower ? buyingPower : <Skeleton className='h-6 w-24' />}</div>
                </div>
                <div>
                  <div className='flex flex-row justify-between'>
                    <div className='text-sm'>Current price</div>
                    <div className='text-sm font-medium flex flex-row items-center gap-2'>{stockCurrentPrice ? stockCurrentPrice : <Skeleton className='h-6 w-24' />}</div>
                  </div>
                </div>
              </div>

            </div>
          }
        </div>
        <div className=" flex flex-col gap-4">
          <StockOrderForm
            tickerCode={ticker as string}
            buyingPower={buyingPower ? buyingPower : 0.00}
            sharesHolding={sharesHolding ? sharesHolding : 0.00}
            userId={user?.id}
            tickerPrice={stockCurrentPrice ? stockCurrentPrice : 0.00}
          />
          {user?.id &&
            <div className='flex my-4'>
              <Link href="/dashboard" className="text-sm text-muted-foreground w-full">
                <Button className="bg-transparent hover:bg-primary/5 text-primary border-2 border-primary w-full rounded-full text-lg px-8 py-6 inline-flex items-center justify-center">
                  Deposit Funds
                </Button>
              </Link>
            </div>
          }

        </div>
      </section>
    </main>
  );
}
