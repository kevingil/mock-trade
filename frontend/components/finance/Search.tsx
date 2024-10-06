"use client"

import { useState, useEffect } from "react"

import Link from "next/link"

import {
  Activity,
  Search as SearchIcon,
} from "lucide-react"

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

export function Search() {
  const [isFocused, setIsFocused] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Result>();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsFocused((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = async (keyword: string) => {
    if (!keyword) {
      return
    }
    try {
      const response = await fetch(`http://localhost:5000/search-tickets?keyword=${keyword}`)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json()
      setResults({ ticketName: data.ticketName, ticketCode: data.ticketCode })
    } catch (error) {
      console.error("Error fetching data:", error)
      setResults({ ticketName: "", ticketCode: "" })
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input value changed:", event.target.value)
    setKeyword(event.target.value)
    handleSearch(event.target.value)
  }


  return (
    <div className="w-1/2 px-4">
      <input
        type="text"
        className="w-full rounded-full px-4 py-2 hidden md:block"
        placeholder="Search..."
        onClick={() => setIsFocused(true)}
      />
      <SearchIcon onClick={() => setIsFocused(true)} className="md:hidden cursor-pointer" />
      <CommandDialog open={isFocused} onOpenChange={setIsFocused}>
         <input className="w-full px-4 py-4 border-0 ring-0 focus:ring-0 focus:border-0 focus:outline-none hidden md:block" placeholder="Search..."
         onChange={handleInputChange} value={keyword} />
        {isFocused && (
          <CommandList>
          {results?.ticketName === "" || results === undefined || keyword === "" ? ( // Check if results array is empty
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <CommandGroup heading="Results">
                <CommandItem key={results.ticketCode}
                className="cursor-pointer p-0">
                <Link className="flex flex-row items-center rounded"
                href={`/stock?ticker=${results.ticketCode}`}
                onClick={() => setIsFocused(false)}>
                  <Activity className="mx-4 h-4 w-4" />
                  <span className="py-4">{results.ticketCode}: {results.ticketName}</span>
                </Link>
                </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
        )}
      </CommandDialog>
    </div>
  )
}
