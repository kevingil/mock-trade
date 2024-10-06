"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface StockOrderFormProps {
  tickerCode: string
  tickerPrice: number
  buyingPowerAvailable: number
  userId: number | undefined
  purchaseShare: (amount: number, type: 'dollars' | 'shares') => Promise<void>
}

export default function StockOrderForm({ tickerCode, tickerPrice, buyingPowerAvailable, userId, purchaseShare }: StockOrderFormProps) {
  const [buyType, setBuyType] = useState<'dollars' | 'shares'>('dollars')
  const [amount, setAmount] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const estimatedQuantity = buyType === 'dollars' ? Number(amount) / tickerPrice : undefined
  const estimatedAmount = buyType === 'shares' ? Number(amount) * tickerPrice : undefined

  const handleReviewOrder = () => {
    setIsDialogOpen(true)
  }

  const handleConfirmOrder = async () => {
    await purchaseShare(Number(amount), buyType)
    setIsDialogOpen(false)
    // Reset form or show success message
  }


  const loggedInCard = () => {
    return (
      <>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={handleReviewOrder}>Review Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Your Order</DialogTitle>
                <DialogDescription>
                  You are about to place an order to buy {tickerCode}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Type: {buyType === 'dollars' ? 'Dollar Amount' : 'Number of Shares'}</p>
                <p>Amount: {buyType === 'dollars' ? `$${amount}` : `${amount} shares`}</p>
                {buyType === 'dollars' && estimatedQuantity && (
                  <p>Estimated Quantity: {estimatedQuantity.toFixed(2)} shares</p>
                )}
                {buyType === 'shares' && estimatedAmount && (
                  <p>Estimated Amount: ${estimatedAmount.toFixed(2)}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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
              <Button onClick={handleReviewOrder} className="w-full">Login</Button>
            </Link>
            <Link href="/sign-up" className="text-sm text-muted-foreground flex-1">
              <Button onClick={handleConfirmOrder} className="w-full">Sign Up</Button>
            </Link>
            </div>
          </div>
        </CardContent>
    )
  }



  return (
    <Card className="w-full md:w-[400px] text-black dark:text-white">
      <CardHeader>
        <CardTitle>Buy {tickerCode}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyType">Buy In</Label>
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
              ${buyingPowerAvailable.toFixed(2)} buying power available
            </div>
          }

        </CardContent>


      {userId ? loggedInCard() : loggedOutCard()}
    </Card>
  )
}
