import React, { useState, useRef, useEffect } from 'react'
import { Input } from './input'

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  allowCustom?: boolean
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    open = false,
    onOpenChange,
    allowCustom = false,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(open)
    const [searchInput, setSearchInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      setIsOpen(open)
    }, [open])

    const filtered = options.filter(opt =>
      opt.label.toLowerCase().includes(searchInput.toLowerCase())
    )

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    const handleSelect = (optValue: string) => {
      onValueChange?.(optValue)
      setSearchInput('')
      handleOpenChange(false)
    }

    const handleEnter = () => {
      if (allowCustom && searchInput.trim()) {
        handleSelect(searchInput.trim())
      }
    }

    return (
      <div ref={ref} className="relative w-full">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            if (!isOpen) handleOpenChange(true)
          }}
          onFocus={() => handleOpenChange(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered.length > 0) {
                handleSelect(filtered[0].value)
              } else if (allowCustom) {
                handleEnter()
              }
            }
          }}
          className="w-full"
        />
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-md bg-white shadow-md">
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                allowCustom && searchInput.trim() ? (
                  <div
                    onClick={() => handleSelect(searchInput.trim())}
                    className="px-4 py-2 cursor-pointer text-sm hover:bg-sky-50 text-gray-700"
                  >
                    Add "{searchInput.trim()}" as new tag
                  </div>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">{emptyText}</div>
                )
              ) : (
                <>
                  {filtered.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`px-4 py-2 cursor-pointer text-sm hover:bg-sky-50 ${
                        value === option.value ? 'bg-sky-100' : ''
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
                  {allowCustom && searchInput.trim() && !filtered.some(o => o.value === searchInput.trim()) && (
                    <div
                      onClick={() => handleSelect(searchInput.trim())}
                      className="px-4 py-2 cursor-pointer text-sm hover:bg-sky-50 border-t text-gray-700"
                    >
                      Add "{searchInput.trim()}" as new tag
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => handleOpenChange(false)}
          />
        )}
      </div>
    )
  }
)
Combobox.displayName = 'Combobox'

export { Combobox }
