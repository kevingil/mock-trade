'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton'; 
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';

type Transaction = {
  ticker: string;
  transaction_type: string;
  quantity: number;
  price: number;
  timestamp: string;
};

export default function HistoryPage() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  if (!user) {
    const path = '/';
    redirect(path);
  }

  useEffect(() => {
    // Fetch transaction data lazily
    async function fetchTransactions() {
      try {
        const response = await fetch(`http://localhost:5000/history/${user?.id}`); 
        const data = await response.json();
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    fetchTransactions();
  }, [user]);

  return (
    <main className="text-gray-800 dark:text-white p-2">
      <section className="py-20 max-w-6xl mx-auto h-full">
      <h2 className="text-2xl mb-12 font-semibold text-gray-900 dark:text-white tracking-tight">Transaction History</h2>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stock</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Shares</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
        {loading ? (
          // Render skeleton loader while fetching
          <SkeletonTable />
        ) : (
          <TransactionsTable transactions={transactions} />
        )}
      </Table>
      </section>
    </main>
  );
}

// Skeleton loader component
function SkeletonTable() {
  return (
    
      <TableBody>
        {Array(5).fill(0).map((_, idx) => (
          <TableRow key={idx}>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
  );
}

// Transactions table component
function TransactionsTable({ transactions }: { transactions: Transaction[] | undefined }) {
  return (
      <TableBody>
        {transactions && transactions.map((txn, idx) => (
          <TableRow key={idx} className=''>
            <TableCell><Link href={`/stock?ticker=${txn.ticker}`}
              className='py-4 text-primary font-bold hover:underline'>{txn.ticker}</Link></TableCell>
            <TableCell>{txn.transaction_type}</TableCell>
            <TableCell>{txn.quantity}</TableCell>
            <TableCell>${txn.price}/share</TableCell>
            <TableCell>{new Date(txn.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
  );
}
