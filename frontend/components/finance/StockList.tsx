import Link from 'next/link'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react'
import OpenAI from "openai";

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

const openai = new OpenAI({
  apiKey: '',
  dangerouslyAllowBrowser: true
});

export default function StockList({ stocks }: StockListProps) {
  const [adviceDialogOpen, setAdviceDialogOpen] = useState(false);
  const [adviceCompletion, setAdviceCompletion] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (adviceDialogOpen && adviceCompletion === undefined) {
      getAdvice();
    }
  }, [adviceDialogOpen]);

  const getAdvice = async () => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "your a helpful financial assistant, help me make an informed decision based on my portfolio. \n " +
            "Please respond with the following bullet points in markdown. \n" +
              "1. what is good about my portfolio\n" +
              "2. what can be improved\n" +
              "3. exact stock ticker to buy\n" +
              "Please use 1 sentence each by bullet points. Only use the proviced context."
          },
          {
            role: "user",
            content: `Here's my stock portfolio: ${JSON.stringify(stocks)}. What's your advice?`
          }
        ],
      });

      setAdviceCompletion(completion.choices[0]?.message?.content || "No advice available.");
    } catch (error) {
      console.error("Error fetching advice:", error);
      setAdviceCompletion("Error fetching advice. Please try again.");
    }
  };

  return (
    <Card className="w-full md:max-w-[400px] bg-transparent">
      <CardHeader className='flex flex-row justify-between pb-0 items-center'>
        <CardTitle className='text-lg'>Your Stocks</CardTitle>
      <div className='mt-0'>
        <Dialog open={adviceDialogOpen} onOpenChange={setAdviceDialogOpen}>
          <DialogTrigger asChild>
            <button className='w-full py-2 px-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 border border-indigo-300 transition-colors'>
              <Sparkles size={15} strokeWidth={1.5}/>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advice</DialogTitle>
            </DialogHeader>
            <div>
              <p>
                {adviceCompletion ? adviceCompletion : 'Loading...'}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
