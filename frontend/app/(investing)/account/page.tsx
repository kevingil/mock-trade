'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function SpendingPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!user) {
          setMessage('Error: User not logged in');
          return;
        }
        const response = await fetch(`http://localhost:5000/balance?user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
        } else {
          setMessage('Error: Failed to fetch balance');
        }
      } catch (error) {
        setMessage('Error: Failed to connect to the server');
      }
    };

    if (user && user.id) {
      fetchBalance();
    }
  }, [user]);

  const handleDeposit = async () => {
    if (!user) {
      setMessage('Error: User not logged in');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        setMessage('Deposit successful');
        // Refresh the balance after a successful deposit
        const balanceResponse = await fetch(`http://localhost:5000/balance?user_id=${user.id}`);
        if (balanceResponse.ok) {
          const data = await balanceResponse.json();
          setBalance(data.balance);
        }
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error: Failed to connect to the server');
    }
  };

  return (
    <main className='text-gray-800 dark:text-white'>
      <section className="py-20 max-w-5xl mx-auto flex flex-col sm:flex-row w-full">
        <div className='flex-1'>
          <div className="mt-4">
            <p className="text-md font-semibold">
              Current Balance
            </p>
            <p className='flex flex-row gap-2 items-center text-3xl'>
              $ {balance !== undefined ? balance?.toFixed(2) : <Skeleton className='w-24 h-8' />}
            </p>
            {message && <p className="mt-4 text-green-600 dark:text-green-400">{message}</p>}
          </div>
        </div>
        <div className='flex-1 flex flex-row border rounded-xl px-6'>
          <div className="mb-4 flex flex-row w-full">
            <div className='w-full'>
              <label htmlFor="amount" className="block text-lg font-medium text-gray-700 dark:text-white py-4">
                Deposit Amount:
              </label>
              <div className='w-full flex rounded-md shadow-sm gap-2 items-center mb-8'>
                <p className='flex flex-row gap-2 items-center text-2xl'>
                  $
                </p>
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                  focus:ring-none border-zinc-600 w-full text-2xl"
                />
                <button
                  onClick={handleDeposit}
                  className="inline-flex w-48 h-12 justify-center items-center px-4 py-2 border border-transparent text-sm font-medium 
            rounded-md shadow-sm text-black dark:text-white bg-zinc-500 hover:bg-zinc-600 focus:outline-none focus:ring-none focus:border-none"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

        </div>

      </section>
    </main>
  );
}
