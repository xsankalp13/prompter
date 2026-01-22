'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addComment, deleteComment } from '@/actions/comments'
import { toast } from 'sonner'
import type { CommentWithAuthor } from '@/types/database'

interface CommentSectionProps {
    promptId: string
    initialComments: CommentWithAuthor[]
    currentUserId?: string
}

export function CommentSection({
    promptId,
    initialComments,
    currentUserId,
}: CommentSectionProps) {
    const [isPending, startTransition] = useTransition()
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState('')

    const handleAddComment = () => {
        if (!newComment.trim()) return

        startTransition(async () => {
            const result = await addComment(promptId, newComment)
            if (result.error) {
                toast.error(result.error)
            } else {
                setNewComment('')
                // Optimistically add the comment
                if (result.comment) {
                    setComments(prev => [...prev, {
                        ...result.comment,
                        profiles: { display_name: 'You', email: null },
                    } as CommentWithAuthor])
                }
                toast.success('Comment added!')
            }
        })
    }

    const handleDeleteComment = (commentId: string) => {
        startTransition(async () => {
            const result = await deleteComment(commentId)
            if (result.error) {
                toast.error(result.error)
            } else {
                setComments(prev => prev.filter(c => c.id !== commentId))
                toast.success('Comment deleted')
            }
        })
    }

    return (
        <div>
            {/* Add Comment */}
            {currentUserId ? (
                <div className="flex gap-3 mb-6">
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[40px] max-h-[100px] text-sm resize-none bg-background border-border"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) {
                                handleAddComment()
                            }
                        }}
                    />
                    <Button
                        onClick={handleAddComment}
                        disabled={isPending || !newComment.trim()}
                        className="h-auto px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground mb-6">
                    Please <a href="/login" className="text-primary hover:underline">log in</a> to comment.
                </p>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first to comment!
                </p>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {comments.map(comment => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-muted/30 rounded-sm p-4 border border-border"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {comment.profiles?.display_name || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1.5">
                                            {comment.content}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {currentUserId === comment.user_id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            disabled={isPending}
                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
