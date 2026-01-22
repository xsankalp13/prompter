'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PromptCard } from '@/components/prompt-card'
import { PromptForm } from '@/components/prompt-form'
import { CategoryFilter } from '@/components/category-filter'
import { getUserPrompts, getCategories } from '@/actions/prompts'
import type { PromptWithCreator } from '@/types/database'

export default function DashboardPage() {
    const [prompts, setPrompts] = useState<PromptWithCreator[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const fetchData = () => {
        startTransition(async () => {
            const [promptsData, categoriesData] = await Promise.all([
                getUserPrompts(
                    selectedCategory !== 'all' ? selectedCategory : undefined,
                    searchQuery || undefined
                ),
                getCategories(),
            ])
            setPrompts(promptsData)
            setCategories(categoriesData)
        })
    }

    useEffect(() => {
        fetchData()
    }, [selectedCategory, searchQuery])

    const handlePromptCreated = () => {
        setDialogOpen(false)
        fetchData()
    }

    const handlePromptDeleted = () => {
        fetchData()
    }

    return (
        <div className="min-h-screen py-8 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Prompts</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage and organize your prompt collection
                        </p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium px-4">
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Create Prompt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border sm:max-w-lg rounded-sm p-6">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-foreground text-lg font-semibold tracking-tight">Create New Prompt</DialogTitle>
                            </DialogHeader>
                            <PromptForm onSuccess={handlePromptCreated} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 rounded-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-9 text-xs focus:border-ring focus:ring-0"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Prompts Grid */}
                {isPending ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-48 rounded-sm border border-border bg-muted/20 animate-pulse"
                            />
                        ))}
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm bg-muted/10">
                        <div className="mb-4 rounded-full bg-muted p-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-sm font-medium text-foreground">No prompts yet</h3>
                        <p className="mb-6 text-xs text-muted-foreground">
                            Create your first prompt to get started
                        </p>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            variant="outline"
                            className="h-8 rounded-sm border-border text-xs hover:bg-muted hover:text-foreground"
                        >
                            Create Prompt
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {prompts.map(prompt => (
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    isOwner={true}
                                    onDelete={handlePromptDeleted}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
