import Link from 'next/link'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface Stock {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  name: string;
  delta: number;
  deltaPercentage: number;
  thumbnail: string;
}

interface StockListProps {
  stocks: Stock[]
}

interface AdviceData {
  answers: {
    answer1: string;
    answer2: string;
    answer3: string[];
  };
  summary: string;
}


export default function StockList({ stocks }: StockListProps) {
  const [adviceDialogOpen, setAdviceDialogOpen] = useState(false);
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adviceDialogOpen && !adviceData && !loading) {
      setLoading(true);
      fetch('http://localhost:5000/stock-advice')
        .then(response => response.json())
        .then((data: AdviceData) => {
          setAdviceData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching advice:', error);
          setLoading(false);
        });
    }
  }, [adviceDialogOpen, adviceData]);

  const renderAdvice = () => {
    if (loading) return <p>Loading advice...</p>;
    if (!adviceData) return <p>Failed to load advice. Please try again.</p>;

    return (
      <div className="space-y-4">
        <h3 className="font-bold">Summary</h3>
        <p>{adviceData.summary}</p>
        <h3 className="font-bold">Strengths</h3>
        <p>{adviceData.answers.answer1}</p>
        <h3 className="font-bold">Areas of Concern</h3>
        <p>{adviceData.answers.answer2}</p>
        <h3 className="font-bold">Recommended Stocks</h3>
        
        <div className='grid grid-cols-2 gap-2'>
          {adviceData.answers.answer3.map((ticker, index) => (
            <div key={index}>
              <Link href={`/stock?ticker=${ticker}`}
                className="text-green-500 font-bold hover:underline w-full">
                {ticker}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full md:max-w-[300px] bg-transparent">
      <CardHeader className='flex flex-row justify-between pb-0 items-center'>
        <CardTitle className='text-lg'>Your Stocks</CardTitle>

        <Dialog open={adviceDialogOpen} onOpenChange={setAdviceDialogOpen}>
          <DialogTrigger asChild>
            <div className=''>
              <button className='w-full py-2 px-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 border border-indigo-300 transition-colors'>
                <Sparkles size={15} strokeWidth={1.5} />
              </button>
            </div>
          </DialogTrigger>
          <DialogContent className='top-1/2'>
            <DialogHeader>
              <DialogTitle>Advice</DialogTitle>
            </DialogHeader>
            <div className="mt-4 min-h-[500px]">
              {renderAdvice()}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <div className="p-2">
        {stocks.length === 0 ? (
          <p className="text-center text-gray-500 py-4 mb-8">No stocks available.</p>
        ) : (
          <ul className="space-y-2">
            {stocks.map((stock) => (
              <li key={stock.ticker}>
                <Link href={`/stock?ticker=${stock.ticker}`} className="flex flex-row gap-2 block p-4 hover:bg-gray-100 dark:hover:bg-gray-600/20 rounded-lg transition-colors">
                  <div className='flex items-center gap-2'>
                    <img src={stock.thumbnail} alt="stock" className="w-10 max-h-10 rounded" />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${stock.delta > 0 ? ' text-primary' : ' text-red-500'}`}>{stock.ticker}</span>
                      </div>
                      <span className="font-semibold">${stock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className='w-full flex justify-between'>
                      <span className="text-sm text-muted-foreground">{stock.quantity} shares</span>
                      <span className='text-xs'>Today <span className={`${stock.delta > 0 ? ' text-primary' : ' text-red-500'}`}>({stock.deltaPercentage.toFixed(2)}%)</span></span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
