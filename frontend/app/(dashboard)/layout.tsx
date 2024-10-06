'use client'

import { Navbar } from '@/components/Navbar';
import { useUser } from '@/lib/auth';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useState } from 'react';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';



export default function Layout({ children }: { children: React.ReactNode }) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    setUser(null);
    await signOut();
    router.push('/');

  }

  return (
    <section className="flex flex-col min-h-screen">
     
     <Navbar
            user={user}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleSignOut={handleSignOut}
          />

        {children}



        <Footer />
            <ScrollToTop />

    </section>
  );
}
