'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    className?: string
    maxTags?: number
}

export function TagInput({
    value,
    onChange,
    placeholder = 'Add tags...',
    className,
    maxTags = 10,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase()
        if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
            onChange([...value, trimmedTag])
        }
        setInputValue('')
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1])
        }
    }

    const handleBlur = () => {
        if (inputValue) {
            addTag(inputValue)
        }
    }

    return (
        <div
            className={cn(
                'flex flex-wrap gap-1.5 p-2 min-h-[42px] rounded-sm bg-background border border-border focus-within:border-ring cursor-text',
                className
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {value.map(tag => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="h-6 gap-1 px-2 text-xs font-normal"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            removeTag(tag)
                        }}
                        className="ml-0.5 hover:text-destructive"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={value.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={value.length >= maxTags}
            />
        </div>
    )
}
