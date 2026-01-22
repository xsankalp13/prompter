'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CategoryFilterProps {
    categories: string[]
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-1.5">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onCategoryChange('all')}
                className={cn(
                    'h-7 rounded-sm px-3 text-xs font-medium transition-all',
                    selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
            >
                All
            </Button>
            {categories.map(category => (
                <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                        'h-7 rounded-sm px-3 text-xs font-medium transition-all',
                        selectedCategory === category
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
