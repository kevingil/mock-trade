"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, Search as SearchIcon } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type Result = {
  ticketName: string
  ticketCode: string
}

type RecentSearch = {
  ticketName: string
  ticketCode: string
  date: string
}


export function Search() {
  const [isFocused, setIsFocused] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsFocused((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);


  useEffect(() => {
    // Load recent searches from localStorage when component mounts
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);


  const handleSearch = async (keyword: string) => {
    if (!keyword) {
      setResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/search-tickets?keyword=${keyword}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Result[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    handleSearch(event.target.value);
  }

  const saveRecentSearch = (result: Result) => {
    const newSearch: RecentSearch = {
      ticketName: result.ticketName,
      ticketCode: result.ticketCode,
      date: new Date().toISOString()
    };

    setRecentSearches(prevSearches => {
      const updatedSearches = [newSearch, ...prevSearches.filter(search => 
        search.ticketCode !== newSearch.ticketCode
      )].slice(0, 4);

      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      return updatedSearches;
    });
  }



  return (
    <div className="">
      <input
        type="text"
        className="w-full rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 hidden md:block focus:outline-none focus:ring-0"
        placeholder="Search..."
        onClick={() => setIsFocused(true)}
      />
      <SearchIcon onClick={() => setIsFocused(true)} className="md:hidden cursor-pointer" />
      <CommandDialog open={isFocused} onOpenChange={setIsFocused}>
        <input
          className="w-full px-4 py-4 border-0 ring-0 focus:ring-0 focus:border-0 focus:outline-none hidden md:block"
          placeholder="Search..."
          onChange={handleInputChange}
          value={keyword}
        />
        {isFocused && (
          <CommandList>
            {results.length === 0 || keyword === "" || !results || !Array.isArray(results) ? (
              <div>
                <CommandEmpty>Recent searches</CommandEmpty>
                {recentSearches.map((search) => (
                  <CommandItem key={search.ticketCode} className="cursor-pointer p-0">
                    <Link
                      className="flex flex-row items-center rounded w-full"
                      href={`/stock?ticker=${search.ticketCode}`}
                      onClick={() => setIsFocused(false)}
                    >
                      <Activity className="mx-4 h-4 w-4" />
                      <span className="py-4">{search.ticketCode}: {search.ticketName}</span>
                    </Link>
                  </CommandItem>
                ))}
              </div>
            ) : (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  <CommandItem key={result.ticketCode} className="cursor-pointer p-0">
                    <Link
                      className="flex flex-row items-center rounded w-full"
                      href={`/stock?ticker=${result.ticketCode}`}
                      onClick={() => {
                        saveRecentSearch(result);
                        setIsFocused(false);
                      }}
                    >
                      <Activity className="mx-4 h-4 w-4" />
                      <span className="py-4">{result.ticketCode}: {result.ticketName}</span>
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </CommandDialog>
    </div>
  )
}
