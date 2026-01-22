'use client'

import { useState, useTransition } from 'react'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { vote } from '@/actions/prompts'
import { toast } from 'sonner'

interface VoteButtonsProps {
    promptId: string
    initialVoteCount: number
    initialUserVote: number | null
    size?: 'sm' | 'default'
}

export function VoteButtons({
    promptId,
    initialVoteCount,
    initialUserVote,
    size = 'default',
}: VoteButtonsProps) {
    const [isPending, startTransition] = useTransition()
    const [voteCount, setVoteCount] = useState(initialVoteCount)
    const [userVote, setUserVote] = useState<number | null>(initialUserVote)

    const handleVote = (voteType: 1 | -1) => {
        startTransition(async () => {
            // Optimistic update
            const previousVote = userVote
            const previousCount = voteCount

            if (userVote === voteType) {
                // Remove vote
                setUserVote(null)
                setVoteCount(prev => prev - voteType)
            } else if (userVote === null) {
                // New vote
                setUserVote(voteType)
                setVoteCount(prev => prev + voteType)
            } else {
                // Change vote (e.g., upvote to downvote)
                setUserVote(voteType)
                setVoteCount(prev => prev - previousVote! + voteType)
            }

            const result = await vote(promptId, voteType)

            if (result.error) {
                // Revert on error
                setUserVote(previousVote)
                setVoteCount(previousCount)
                toast.error(result.error)
            }
        })
    }

    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleVote(1)
                }}
                disabled={isPending}
                className={cn(
                    buttonSize,
                    'rounded-sm p-0 transition-colors',
                    userVote === 1
                        ? 'text-primary bg-primary/10 hover:bg-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
            >
                <ArrowBigUp className={cn(iconSize, userVote === 1 && 'fill-current')} />
            </Button>

            <span className={cn(
                'min-w-[2rem] text-center font-medium tabular-nums',
                size === 'sm' ? 'text-xs' : 'text-sm',
                voteCount > 0 ? 'text-primary' : voteCount < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
                {voteCount}
            </span>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleVote(-1)
                }}
                disabled={isPending}
                className={cn(
                    buttonSize,
                    'rounded-sm p-0 transition-colors',
                    userVote === -1
                        ? 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                )}
            >
                <ArrowBigDown className={cn(iconSize, userVote === -1 && 'fill-current')} />
            </Button>
        </div>
    )
}
