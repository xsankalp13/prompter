'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, Users, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { searchPromptById, deletePromptAsAdmin, getPromptStats } from '@/actions/admin'
import { toast } from 'sonner'
import type { PromptWithCreator } from '@/types/database'

interface Stats {
    totalPrompts: number
    totalUsers: number
    recentPrompts: { id: string; title: string; created_at: string }[]
    topCategories: { name: string; count: number }[]
}

export default function AdminPage() {
    const [searchId, setSearchId] = useState('')
    const [foundPrompt, setFoundPrompt] = useState<PromptWithCreator | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            const statsData = await getPromptStats()
            setStats(statsData)
        })
    }, [])

    const handleSearch = () => {
        if (!searchId.trim()) {
            toast.error('Please enter a prompt ID')
            return
        }

        startTransition(async () => {
            const prompt = await searchPromptById(searchId.trim())
            if (prompt) {
                setFoundPrompt(prompt)
                toast.success('Prompt found')
            } else {
                setFoundPrompt(null)
                toast.error('Prompt not found')
            }
        })
    }

    const handleDelete = () => {
        if (!foundPrompt) return

        startTransition(async () => {
            const result = await deletePromptAsAdmin(foundPrompt.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Prompt deleted successfully')
                setFoundPrompt(null)
                setSearchId('')
                setDeleteDialogOpen(false)
                // Refresh stats
                const statsData = await getPromptStats()
                setStats(statsData)
            }
        })
    }

    return (
        <div className="min-h-screen py-8 bg-background pt-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 border-b border-border pb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Panel</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage prompts and view platform statistics
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-card border-border rounded-sm backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Prompts</CardDescription>
                                <CardTitle className="text-3xl font-light text-foreground">
                                    {stats?.totalPrompts ?? '-'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-muted-foreground text-xs">
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    <span>All stored prompts</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-card border-border rounded-sm backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Users</CardDescription>
                                <CardTitle className="text-3xl font-light text-foreground">
                                    {stats?.totalUsers ?? '-'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-muted-foreground text-xs">
                                    <Users className="mr-1.5 h-3.5 w-3.5" />
                                    <span>Registered accounts</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="sm:col-span-2"
                    >
                        <Card className="bg-card border-border rounded-sm backdrop-blur-sm h-full">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Categories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {stats?.topCategories.map((cat, i) => (
                                        <div
                                            key={cat.name}
                                            className="inline-flex items-center rounded-sm border border-border bg-muted/50 px-2.5 py-1 text-xs text-foreground"
                                        >
                                            <span className="font-medium mr-1.5">{cat.name}</span>
                                            <span className="text-muted-foreground">{cat.count}</span>
                                        </div>
                                    )) ?? <span className="text-muted-foreground text-xs">No data available</span>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Search Section */}
                <Card className="mb-8 bg-card border-border rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">Search Prompt by ID</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Enter a prompt UUID to find and manage specific content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Enter prompt ID (UUID)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="h-9 rounded-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-9 text-xs focus:border-ring focus:ring-0"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={isPending}
                                className="h-9 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium px-4"
                            >
                                Search
                            </Button>
                        </div>

                        {/* Search Result */}
                        {foundPrompt && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6"
                            >
                                <Separator className="mb-6 bg-border" />
                                <div className="rounded-sm border border-border bg-muted/20 p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <div className="mb-2 inline-flex items-center rounded-sm border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                {foundPrompt.category}
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground tracking-tight">
                                                {foundPrompt.title}
                                            </h3>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setDeleteDialogOpen(true)}
                                            className="h-8 rounded-sm bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 hover:text-destructive border border-destructive/20 text-xs"
                                        >
                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                            Delete
                                        </Button>
                                    </div>

                                    <p className="mb-6 text-sm text-muted-foreground font-light leading-relaxed">{foundPrompt.content}</p>

                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-mono">
                                        <span>ID: {foundPrompt.id}</span>
                                        <span>
                                            User: {foundPrompt.profiles?.display_name || 'Unknown'}
                                        </span>
                                        <span>
                                            Date: {new Date(foundPrompt.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Prompts */}
                <Card className="bg-card border-border rounded-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Recent Prompts
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Latest activity on the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats?.recentPrompts.map(prompt => (
                                <div
                                    key={prompt.id}
                                    className="flex items-center justify-between rounded-sm border border-border bg-muted/10 p-3 hover:bg-muted/20 transition-colors"
                                >
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground">{prompt.title}</h4>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                            {new Date(prompt.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchId(prompt.id)
                                            handleSearch()
                                        }}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Inspect
                                    </Button>
                                </div>
                            )) ?? (
                                    <p className="text-muted-foreground text-xs italic">No recent prompts</p>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="bg-background border-border rounded-sm">
                        <DialogHeader>
                            <DialogTitle className="text-foreground flex items-center gap-2 text-lg">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                Are you sure you want to delete this prompt? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-sm border border-border bg-muted/50 p-4 my-2">
                            <p className="font-medium text-foreground text-sm">{foundPrompt?.title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">{foundPrompt?.id}</p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setDeleteDialogOpen(false)}
                                className="h-9 rounded-sm text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="h-9 rounded-sm bg-destructive hover:bg-destructive/90 text-xs"
                            >
                                Delete Prompt
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
