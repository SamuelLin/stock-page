import { useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  disabled?: boolean
  defaultValue?: string
}

export function SearchBar({ 
  onSearch, 
  placeholder = "輸入股票代號或名稱...", 
  disabled = false,
  defaultValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)

  const handleSearch = () => {
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">清除搜尋</span>
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={disabled || !query.trim()}
          className="px-6"
        >
          搜尋
        </Button>
      </div>
      
      {/* 提示文字 */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        輸入完成後點擊搜尋按鈕或按 Enter 鍵
      </p>
    </form>
  )
}
