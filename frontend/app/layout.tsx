
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { ThemeProvider } from '@/components/theme-provider';


export const metadata: Metadata = {
  title: 'SellScaleHood',
  description: 'Free stock trading'
}
export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  let userPromise = getUser();

  return (

    <html
      lang="en"
      className={`${manrope.className}`}
    >

      <body className="min-h-[100dvh]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >

          <UserProvider userPromise={userPromise}>

            {children}
          </UserProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}
