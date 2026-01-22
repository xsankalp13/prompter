import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { VoteButtons } from '@/components/vote-buttons'
import { AITestButtons } from '@/components/ai-test-buttons'
import { getPromptById } from '@/actions/prompts'
import { getComments } from '@/actions/comments'
import { getUserProfile } from '@/actions/auth'
import { Navbar } from '@/components/navbar'
import { CommentSection } from './comment-section'
import { CopyButtonClient } from './copy-button-client'


interface PromptPageProps {
    params: Promise<{ id: string }>
}

export default async function PromptPage({ params }: PromptPageProps) {
    const { id } = await params
    const [prompt, comments, user] = await Promise.all([
        getPromptById(id),
        getComments(id),
        getUserProfile(),
    ])

    if (!prompt) {
        notFound()
    }

    const displayTags = prompt.tags && prompt.tags.length > 0 ? prompt.tags : [prompt.category]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar user={user} />

            <main className="relative pt-24 pb-16">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Feed
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {displayTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs font-normal px-2.5 py-1"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                            {prompt.title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-muted-foreground mb-2">
                            <p>
                                by <span className="font-medium text-foreground">{prompt.profiles?.display_name || 'Anonymous'}</span>
                                {' · '}
                                {new Date(prompt.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <VoteButtons
                                    promptId={prompt.id}
                                    initialVoteCount={prompt.vote_count ?? prompt.favorite_count ?? 0}
                                    initialUserVote={prompt.user_vote ?? null}
                                />
                                <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
                                <CopyButton content={prompt.content} />
                            </div>
                        </div>
                        <div className='border-border border-t pt-2 '></div>


                    </div>
                    <div className='w-full flex justify-between items-center mb-5'>
                        <p className='text-md text-muted-foreground'>Try with : </p>
                        <AITestButtons promptContent={prompt.content} />
                    </div>


                    {/* Prompt Content */}
                    <div className="mb-8 bg-muted/30 rounded-sm p-6 border border-border">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {prompt.content}
                        </p>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-border pt-8">
                        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Comments ({comments.length})
                        </h2>

                        <CommentSection
                            promptId={prompt.id}
                            initialComments={comments}
                            currentUserId={user?.id}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

// Client component for copy functionality
function CopyButton({ content }: { content: string }) {
    return (
        <form
            action={async () => {
                'use server'
            }}
        >
            <CopyButtonClient content={content} />
        </form>
    )
}

