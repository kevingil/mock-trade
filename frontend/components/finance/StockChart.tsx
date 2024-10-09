"use client"

import React, { useState, useEffect, useRef } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js'
import { RadioGroupButton, RadioGroupItem } from "@/components/ui/radio-group-button"
import { Label } from "@/components/ui/label"
import { ne } from "drizzle-orm"

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface StockChartProps {
  stockData: StockData
  onRangeChange: (range: string) => void
}

interface DateRange {
  label: string;
  value: string;
}

export const dateRanges: DateRange[] = [
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '5d' },
  { label: '1 Month', value: '1mo' },
  { label: '3 Months', value: '3mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '5 Years', value: '5y' },
  { label: 'Max', value: 'max' },
]

export interface StockData {
  tickerName: string
  tickerCode: string
  currentPrice: number
  delta: number
  deltaPercentage: number
  data: { date: string; price: number }[]
}


const positiveColor: string = 'hsl(142.1 76.2% 36.3%)';
const negativeColor: string = 'hsl(19 100% 50%)';

export default function StockChart({ stockData, onRangeChange }: StockChartProps) {
  const [selectedRange, setSelectedRange] = useState('1d')
  const chartRef = useRef<Chart<"line">>(null)

  // Data for Chart.js
  const data: ChartData<"line"> = {
    labels: stockData.data.map(dataPoint => dataPoint.date),
    datasets: [
      {
        label: `${stockData.tickerName} (${stockData.tickerCode})`,
        data: stockData.data.map(dataPoint => dataPoint.price),
        borderColor: stockData.delta < 0 ? negativeColor : positiveColor,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false,
        text: `Stock Prices: ${stockData.tickerName} (${stockData.tickerCode})`,
      },
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [stockData]);

  // Handle Date Range Change (can be a form or custom component)
  const handleDateRangeChange = (range: string) => {
    setSelectedRange(range);
    onRangeChange(range);
  };



  return (
    <div className="w-full">
      <div className=" font-medium text-3xl">{stockData.tickerName}</div>
      <div className="font-medium text-4xl mb-8 tracking-tight">${stockData.currentPrice}</div>

      <Line ref={chartRef} data={data} options={options} />

      <RadioGroupButton
        value={selectedRange}
        onValueChange={handleDateRangeChange}
        className="flex flex-wrap gap-4 text-medium"
      >
        {dateRanges.map((range) => (
          <div key={range.value} className="flex items-center space-x-2">
            <RadioGroupItem value={range.value} id={range.value}
              className="" />
            {stockData.delta < 0 ?
              <Label htmlFor={range.value}
                className={"cursor-pointer hover:text-red-500 py-4"
                  + (selectedRange === range.value ? " text-red-500 border-red-500 border-b-2" : "")
                }>{range.label}</Label>
              :
              <Label htmlFor={range.value}
                className={"cursor-pointer hover:text-primary py-4"
                  + (selectedRange === range.value ? " text-primary border-primary border-b-2" : "")
                }>{range.label}</Label>

            }
          </div>
        ))}
      </RadioGroupButton>
    </div>
  )
}
