'use client'

import { useState, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { Input } from '@/components/ui/input'
import { PromptCard } from '@/components/prompt-card'
import { CategoryFilter } from '@/components/category-filter'
import { Navbar } from '@/components/navbar'
import { getPrompts, getCategories } from '@/actions/prompts'
import { getUserProfile } from '@/actions/auth'
import { Toaster } from '@/components/ui/sonner'

export default function FeedPage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: user } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => await getUserProfile(),
    })

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => await getCategories(),
    })

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['prompts', selectedCategory, searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const { prompts, hasMore } = await getPrompts(
                pageParam as number,
                selectedCategory !== 'all' ? selectedCategory : undefined,
                searchQuery || undefined
            )
            return { prompts, hasMore, nextPage: hasMore ? (pageParam as number) + 1 : undefined }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    })

    const prompts = data?.pages.flatMap(page => page.prompts) || []
    const isPending = status === 'pending'

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    })

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar user={user ?? null} />

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
                                We couldn&apos;t find anything matching your criteria. Try adjusting your filters.
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
                                {isFetchingNextPage && (
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
