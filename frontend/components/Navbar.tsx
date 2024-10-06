"use client"

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useEffect, useState } from 'react';
import { buttonVariants } from "@/components/ui/button";
import HoodIcon from "@/components/icons/Hood";
import { Menu, Home, LogOut } from "lucide-react";
import { ToggleTheme } from "@/components/toggle-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "@/components/finance/Search";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "/investing",
    label: "Investing",
  },
  {
    href: "/account",
    label: "Spending",
  },
  {
    href: "/history",
    label: "History",
  },
];

interface NavbarProps {
  user: any;
  isMenuOpen: boolean;
  isDropdownOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  handleSignOut: () => Promise<void>;
}

export const Navbar = ({ user, isMenuOpen, setIsMenuOpen, isDropdownOpen, setIsDropdownOpen, handleSignOut }: NavbarProps) => {

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true));
  if (!mounted) return null;

  return (
    <header className="sticky border-b-[1px] top-0 z-40 overflow-auto w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto overflow-visible relative">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between overflow-auto">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-semibold items-center flex text-gray-900 dark:text-white fill-gray-900 dark:fill-white dark:hover:text-primary dark:hover:fill-primary hover:text-primary hover:fill-primary text-2xl"
            >
              <HoodIcon className="w-12" />
              SellScaleHood
            </a>
          </NavigationMenuItem>

          <span className="flex md:hidden gap-2">
            <Search/>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger className="px-2">
                <Menu className="flex md:hidden h-5 w-5">
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"right"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    SellScaleHood
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col items-start gap-4 text-lg mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={buttonVariants({ variant: "ghost" }) + " "}
                    >
                      {label}
                    </a>
                  ))}

                  {user ? (
                    <>
                      <Link href="/dashboard" className={buttonVariants({ variant: "ghost" }) + ""}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>

                      <form action={handleSignOut} className="w-full">
                        <button type="submit" className={buttonVariants({ variant: "ghost" }) }>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </form>
                    </>

                  ) : (
                    <>
                      <Link href="/sign-in">Sign In</Link>

                      <Button
                        asChild
                        className="bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-black text-sm px-4 py-2 rounded-full"
                      >
                        <Link href="/sign-up">Sign Up</Link>
                      </Button>
                    </>
                  )}
                  <div className={buttonVariants({ variant: "ghost" }) }>
                    <ToggleTheme />
                  </div>


                </nav>
              </SheetContent>
            </Sheet>
          </span>

          

          <nav className="hidden md:flex gap-2">
          <Search />
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-[17px] hover:text-primary px-2 hover:bg-transparent ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2 items-center">
            {user ? (
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer flex flex-row items-center gap-2 p-1 rounded-full
                  border-gray-300/50 dark:border-slate-700 border px-2 w-full">
                  <Avatar className="size-9">
                    <AvatarImage alt={user.name || ''} />
                    <AvatarFallback>
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className='pr-2'> 
                  { user.name  || "User" }
                  </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="flex flex-col gap-1">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/dashboard" className="flex w-full items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer">
                    <ToggleTheme />
                  </DropdownMenuItem>
                  <form action={handleSignOut} className="w-full">
                    <button type="submit" className="flex w-full">
                      <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='flex flex-row items-center gap-4'>
                <Link href="/sign-in">Sign In</Link>

                <Button
                  asChild
                  className="bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-black text-sm px-4 py-2 rounded-full"
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
