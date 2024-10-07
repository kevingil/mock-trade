import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Stock {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  name: string; 
}


interface StockListProps {
  stocks: Stock[]
}

export default function StockList({ stocks }: StockListProps) {
  return (
    <Card className="w-full md:max-w-[400px] bg-transparent">
      <CardHeader>
        <CardTitle>Your Stocks</CardTitle>
      </CardHeader>
      <div className="p-2">
        {stocks.length === 0 ? (
          <p className="text-center text-gray-500">No stocks available.</p>
        ) : (
          <ul className="space-y-2">
            {stocks.map((stock) => (
              <li key={stock.ticker}>
                <Link href={`/stock?ticker=${stock.ticker}`} className="block p-4 hover:bg-gray-100 dark:hover:bg-black/20 rounded-lg transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">{stock.ticker}</span>
                      <span className="text-sm text-muted-foreground">{stock.quantity} shares</span>
                    </div>
                    <span className="font-semibold">${stock.currentPrice.toFixed(2)}</span>
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
