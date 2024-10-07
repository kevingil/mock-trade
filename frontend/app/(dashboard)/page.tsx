'use client'

import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database, DollarSign } from 'lucide-react';
import { Cta } from '@/components/home/Cta';
import { About } from '@/components/home/About';
import { HowItWorks } from '@/components/home/HowItWorks';
import { useUser } from '@/lib/auth';


export default function HomePage() {
  const { user } = useUser();

  return (
    <main className='text-gray-800 dark:text-white'>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl md:text-6xl">
                Comission Free
                <span className="block text-primary">Stock Trading</span>
              </h1>
              <p className="mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Launch your SaaS product in record time with our powerful,
                ready-to-use template. Packed with modern technologies and
                essential integrations.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                {user ? (
                   <a
                   href="/investing"
                   target=""
                 >
                   <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 
                     rounded-full text-lg px-8 py-6 inline-flex items-center justify-center">
                     Invest
                     <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                 </a>
                )
                : (
                  <div className="flex flex-row gap-2">
                  <a
                    href="/sign-up"
                    target=""
                  >
                    <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 
                      rounded-full text-lg px-8 py-6 inline-flex items-center justify-center">
                      Sign Up
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a
                    href="/sign-in"
                    target=""
                  >
                    <Button className="bg-transparent text-black  dark:text-white border dark:border-white hover:bg-black/10 dark:hover:bg-white/10 
                      rounded-full text-lg px-8 py-6 inline-flex items-center justify-center">
                      Login
                    </Button>
                  </a>
                  </div>
                )}
               
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <img src='/trading-app.png' className="w-full max-w-[48rem]" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <DollarSign />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Zero Commissions
                </h2>
                <p className="mt-2 text-base">
                  Enjoy commission-free trading on all stocks, ensuring you keep more of your profits and avoid unnecessary fees.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Real-Time Market Data
                </h2>
                <p className="mt-2 text-base">
                  Get live updates on stock prices and track your portfolio with accurate market data, giving you an edge in your trades.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Secure Transactions
                </h2>
                <p className="mt-2 text-base">
                  All your trades and personal data are safeguarded with advanced encryption and security protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto">

        <About />
        <HowItWorks />
        <Cta />
      </section>
    </main>
  );
}
