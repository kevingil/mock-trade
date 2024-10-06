"use client"

import React, { useState, useEffect, useRef } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ChartData, ChartOptions } from 'chart.js'
import { RadioGroupButton, RadioGroupItem } from "@/components/ui/radio-group-button"
import { Label } from "@/components/ui/label"

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface StockChartProps {
  chartData: { date: string; price: number }[]
  ticketCode: string
  ticketName: string
  currentPrice: string 
  onRangeChange: (range: string) => void
}

interface DateRange {
  label: string;
  value: string;
}

export const dateRanges: DateRange[] = [
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: 'YTD', value: 'ytd' },
  { label: '5 Years', value: '5y' },
  { label: 'Max', value: 'max' },
]

const positiveColor: string = 'hsl(142.1 76.2% 36.3%)';
const negativeColor: string = 'hsl(0 66.7% 40.2%)';

export default function StockChart({ chartData, ticketCode, ticketName, currentPrice, onRangeChange }: StockChartProps) {
  const [selectedRange, setSelectedRange] = useState('1d')
  const chartRef = useRef<Chart<"line">>(null)
  const [lineColor, setLineColor] = useState<string>(positiveColor)
  
  // Data for Chart.js
  const data: ChartData<"line"> = {
    labels: chartData.map(dataPoint => dataPoint.date),
    datasets: [
      {
        label: `${ticketName} (${ticketCode})`,
        data: chartData.map(dataPoint => dataPoint.price),
        borderColor: lineColor,
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
        text: `Stock Prices: ${ticketName} (${ticketCode})`,
      },
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [chartData]);

  // Handle Date Range Change (can be a form or custom component)
  const handleDateRangeChange = ( range: string) => {
    setSelectedRange(range);
    onRangeChange(range);
  };



  return (
    <div className="w-full space-y-4">
      <div className=" font-medium text-4xl">{ticketName}</div>
      <h3 className="font-medium text-2xl">{currentPrice}</h3>

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
            <Label htmlFor={range.value}
            className={"cursor-pointer hover:text-primary py-4"
              + (selectedRange === range.value ? " text-primary border-primary border-b-2" : "")
            }>{range.label}</Label>
          </div>
        ))}
      </RadioGroupButton>
    </div>
  )
}
