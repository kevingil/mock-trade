"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface StockOrderFormProps {
  tickerCode: string
  tickerPrice: number
  buyingPower: number
  sharesHolding: number
  userId: number | undefined
}

enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export type StockOrderRequest = {
  tickerCode: string
  transactionType: TransactionType
  sharesQuantity: number
  currentPrice: number
  userId: number
}

export default function StockOrderForm({ tickerCode, tickerPrice, buyingPower, sharesHolding, userId }: StockOrderFormProps) {
  const [buyType, setBuyType] = useState<'dollars' | 'shares'>('dollars')
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.BUY)
  const [amount, setAmount] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  let estimatedQuantity = buyType === 'dollars' ? Number(amount) / tickerPrice : undefined
  let estimatedAmount = buyType === 'shares' ? Number(amount) * tickerPrice : undefined

  const handleReviewOrder = () => {
    setIsDialogOpen(true)
  }

  const handleConfirmOrder = async () => {
    const sharesQuantity = buyType === 'dollars' ? Number(amount) / tickerPrice : Number(amount)
    let response;
    if (!userId) return
    let req: StockOrderRequest = {
      tickerCode: tickerCode,
      transactionType: transactionType,
      sharesQuantity: sharesQuantity,
      currentPrice: tickerPrice,
      userId: userId
    }

    try {
      response = await fetch('http://localhost:5000/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transaction failed')
      }
      window.location.reload();
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      // Keep the dialog open to show the error
    }
  }

  const loggedInCard = () => {
    return (
      <>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={handleReviewOrder}
                {...(transactionType === TransactionType.BUY ?
                  buyType === 'dollars'? { disabled: Number(amount) > buyingPower } : { disabled: Number(amount) > buyingPower / tickerPrice }
                  : buyType === 'shares'? { disabled: Number(amount) > sharesHolding } : { disabled: Number(amount) > sharesHolding * tickerPrice })}>Review Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Your Order</DialogTitle>
                <DialogDescription>
                  You are about to place an order to {transactionType.toLowerCase()} {tickerCode}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex flex-col gap-2">
                <p className="font-bold my-2">{transactionType === TransactionType.BUY ? 'Purchase' : 'Sale'}</p>
                {buyType === 'shares' && estimatedAmount && (
                  <p>Amount: $ {estimatedAmount.toFixed(2)}</p>
                )}
                {buyType === 'shares' && estimatedAmount && (
                  <p>Quantity: {amount}</p>
                )}
                {buyType === 'dollars' && estimatedQuantity && (
                  <p>Amount: $ {amount}</p>
                )}
                {buyType === 'dollars' && estimatedQuantity && (
                  <p>Quantity: {estimatedQuantity.toFixed(6)} shares</p>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setError(null)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmOrder}>Confirm Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </>
    )
  }

  const loggedOutCard = () => {
    return (
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="py-6">Please login to trade.</p>
          <div className="flex flex-row gap-2">
            <Link href="/sign-in" className="text-sm text-muted-foreground flex-1">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/sign-up" className="text-sm text-muted-foreground flex-1">
              <Button className="w-full">Sign Up</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    )
  }

  return (
    <Card className="w-full md:w-[400px] text-black dark:text-white h-fit">
      <div className="flex border-b-2 my-2 mb-4 px-2">
        <button
          className={`px-4 py-3 text-center text-sm font-bold border-b-2 ${transactionType === TransactionType.BUY ? 'border-primary text-primary font-bold' : 'border-transparent '
            }`}
          onClick={() => setTransactionType(TransactionType.BUY)}
        >
          Buy {tickerCode}
        </button>
        <button
          className={`px-4 py-3 text-center text-sm font-bold border-b-2 ${transactionType === TransactionType.SELL ? ' border-primary text-primary font-bold' : 'border-transparent '
            }`}
          onClick={() => setTransactionType(TransactionType.SELL)}
        >
          Sell {tickerCode}
        </button>
      </div>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyType">{transactionType === TransactionType.BUY ? 'Buy' : 'Sell'} In</Label>
          <Select defaultValue="dollars"
            onValueChange={(value: 'dollars' | 'shares') => setBuyType(value)}>
            <SelectTrigger id="buyType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dollars">Dollars</SelectItem>
              <SelectItem value="shares">Shares</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder={buyType === 'dollars' ? 'Enter dollar amount' : 'Enter number of shares'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {buyType === 'dollars' && estimatedQuantity
          ? <div className="text-sm">Est. Quantity: {estimatedQuantity.toFixed(6)} shares</div>
          : buyType === 'shares' && estimatedAmount
            ? <div className="text-sm">Est. Amount: ${estimatedAmount.toFixed(2)}</div>
            : <div></div>
        }
        {userId &&
          <div className="text-sm">

          </div>
        }
        {transactionType === TransactionType.BUY && userId
          ? <div className="text-sm"> ${buyingPower.toFixed(2)} buying power available</div>
          : transactionType === TransactionType.SELL && userId
            ? <div className="text-sm">{sharesHolding} shares available</div>
            : <div></div>
        }
      </CardContent>

      {userId ? loggedInCard() : loggedOutCard()}
    </Card>
  )
}
