'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/auth';
import StockChart from '@/components/finance/StockChart';
import StockOrderForm from '@/components/finance/StockOrderForm';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  date: string;
  price: number;
}

type DateRange = {
  code: string;
};

export default function TicketPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ code: '1w' });
  const [ticketName, setTicketName] = useState('');
  const [stockCurrentPrice, setStockCurrentPrice] = useState<number | undefined>(undefined);
  const [buyingPower, setBuyingPower] = useState<number | undefined>(undefined);
  const { user, setUser } = useUser();
  const searchParams = useSearchParams();
  const ticker = searchParams.get('ticker');

  useEffect(() => {
    const fetchStockData = async () => {
      if (!ticker || !dateRange.code) return;

      try {
        const response = await fetch(
          `http://localhost:5000/get-stock-data?ticketCode=${ticker}&dateRange=${dateRange.code}`
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
      try {
        const response = await fetch(`http://localhost:5000/balance?user_id=${user?.id}`);
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
    <main className="text-gray-800 dark:text-white  max-w-7xl mx-auto">
      <section className="py-20 flex flex-row gap-2">
        <div className='w-full'>
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
        </div>
        <StockOrderForm
          tickerCode={ticker as string}
          buyingPowerAvailable={buyingPower? buyingPower : 0.00}
          userId={user?.id}
          tickerPrice={stockCurrentPrice ? stockCurrentPrice : 0.00}
          purchaseShare={(amount: number, type: 'dollars' | 'shares') => Promise.resolve()}
        />
      </section>
    </main>
  );
}
