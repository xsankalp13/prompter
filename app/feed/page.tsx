'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { Input } from '@/components/ui/input'
import { PromptCard } from '@/components/prompt-card'
import { CategoryFilter } from '@/components/category-filter'
import { Navbar } from '@/components/navbar'
import { getPrompts, getCategories } from '@/actions/prompts'
import { getUserProfile } from '@/actions/auth'
import type { PromptWithCreator, Profile } from '@/types/database'
import { Toaster } from '@/components/ui/sonner'

export default function FeedPage() {
    const [prompts, setPrompts] = useState<PromptWithCreator[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [user, setUser] = useState<Profile | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    })

    // Initial load
    useEffect(() => {
        startTransition(async () => {
            const [userProfile, categoriesData] = await Promise.all([
                getUserProfile(),
                getCategories(),
            ])
            setUser(userProfile)
            setCategories(categoriesData)
        })
    }, [])

    // Fetch prompts on filter change
    useEffect(() => {
        setPage(1)
        setPrompts([])
        setHasMore(true)

        startTransition(async () => {
            const { prompts: newPrompts, hasMore: more } = await getPrompts(
                1,
                selectedCategory !== 'all' ? selectedCategory : undefined,
                searchQuery || undefined
            )
            setPrompts(newPrompts)
            setHasMore(more)
        })
    }, [selectedCategory, searchQuery])

    // Load more on scroll
    useEffect(() => {
        if (inView && hasMore && !isPending && !isLoadingMore) {
            setIsLoadingMore(true)
            const nextPage = page + 1

            getPrompts(
                nextPage,
                selectedCategory !== 'all' ? selectedCategory : undefined,
                searchQuery || undefined
            ).then(({ prompts: newPrompts, hasMore: more }) => {
                setPrompts(prev => [...prev, ...newPrompts])
                setHasMore(more)
                setPage(nextPage)
                setIsLoadingMore(false)
            })
        }
    }, [inView, hasMore, isPending, isLoadingMore, page, selectedCategory, searchQuery])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar user={user} />

            <main className="relative pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Prompts</h1>
                        <p className="mt-2 text-sm text-muted-foreground font-light">
                            Discover amazing prompts from the community
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
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
                    {isPending && prompts.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-48 rounded-sm border border-border bg-muted/20 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : prompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-sm bg-muted/10">
                            <h3 className="mb-2 text-sm font-medium text-foreground">No prompts found</h3>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                We couldn't find anything matching your criteria. Try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {prompts.map(prompt => (
                                        <PromptCard
                                            key={prompt.id}
                                            prompt={prompt}
                                            isOwner={false}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Infinite scroll trigger */}
                            <div ref={ref} className="mt-12 flex justify-center">
                                {isLoadingMore && (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Toaster />
        </div>
    )
}
