'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Trash2, MoreVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VoteButtons } from '@/components/vote-buttons'
import { deletePrompt } from '@/actions/prompts'
import { toast } from 'sonner'
import type { PromptWithCreator } from '@/types/database'
import { useTransition } from 'react'

interface PromptCardProps {
    prompt: PromptWithCreator
    isOwner?: boolean
    showActions?: boolean
    onDelete?: () => void
}

export function PromptCard({
    prompt,
    isOwner = false,
    showActions = true,
    onDelete,
}: PromptCardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await navigator.clipboard.writeText(prompt.content)
        toast.success('Copied to clipboard!')
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        startTransition(async () => {
            const result = await deletePrompt(prompt.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Prompt deleted')
                onDelete?.()
            }
        })
    }

    const handleCardClick = () => {
        router.push(`/prompt/${prompt.id}`)
    }

    // Determine tags to display
    const displayTags = prompt.tags && prompt.tags.length > 0 ? prompt.tags : [prompt.category]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -2 }}
            onClick={handleCardClick}
            className={cn(
                'group relative flex flex-col justify-between rounded-sm border border-border bg-card p-5 backdrop-blur-md transition-all hover:border-primary/20 hover:bg-card/80 cursor-pointer',
                isPending && 'opacity-50 pointer-events-none'
            )}
        >
            <div className="relative">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            {displayTags.slice(0, 3).map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-[10px] font-normal px-2 py-0.5"
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {displayTags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                    +{displayTags.length - 3}
                                </span>
                            )}
                        </div>
                        <h3 className="font-medium text-card-foreground line-clamp-1 tracking-tight">
                            {prompt.title}
                        </h3>
                    </div>

                    {showActions && isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-sm border-border bg-popover p-1">
                                <DropdownMenuItem onClick={handleDelete} className="rounded-sm text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete Prompt
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Content */}
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground line-clamp-3 font-light">
                    {prompt.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {prompt.profiles?.display_name || 'Anonymous'}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-7 w-7 rounded-sm p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>

                        {showActions && (
                            <VoteButtons
                                promptId={prompt.id}
                                initialVoteCount={prompt.vote_count ?? prompt.favorite_count ?? 0}
                                initialUserVote={prompt.user_vote ?? null}
                                size="sm"
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
