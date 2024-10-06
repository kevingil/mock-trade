"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface StockOrderFormProps {
  tickerCode: string
  buyingPowerAvailable: number
  user_id: string
  purchaseShare: (amount: number, type: 'dollars' | 'shares') => Promise<void>
}

export default function StockOrderForm({ tickerCode, buyingPowerAvailable, user_id, purchaseShare }: StockOrderFormProps) {
  const [buyType, setBuyType] = useState<'dollars' | 'shares'>('dollars')
  const [amount, setAmount] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const estimatedQuantity = buyType === 'dollars' ? Number(amount) / 100 : undefined // Mocked price of $100 per share
  const estimatedAmount = buyType === 'shares' ? Number(amount) * 100 : undefined // Mocked price of $100 per share

  const handleReviewOrder = () => {
    setIsDialogOpen(true)
  }

  const handleConfirmOrder = async () => {
    await purchaseShare(Number(amount), buyType)
    setIsDialogOpen(false)
    // Reset form or show success message
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Buy {tickerCode}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyType">Buy In</Label>
          <Select onValueChange={(value: 'dollars' | 'shares') => setBuyType(value)}>
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
        {buyType === 'dollars' && estimatedQuantity && (
          <div>Est. Quantity: {estimatedQuantity.toFixed(2)} shares</div>
        )}
        {buyType === 'shares' && estimatedAmount && (
          <div>Est. Amount: ${estimatedAmount.toFixed(2)}</div>
        )}
        <div className="text-sm text-muted-foreground">
          ${buyingPowerAvailable.toFixed(2)} buying power available
        </div>
      </CardContent>
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
    </Card>
  )
}
