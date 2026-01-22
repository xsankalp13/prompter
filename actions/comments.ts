'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CommentWithAuthor } from '@/types/database'

export async function getComments(promptId: string): Promise<CommentWithAuthor[]> {
    const supabase = await createClient()

    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    if (!comments || comments.length === 0) return []

    // Get unique user IDs
    const userIds = [...new Set(comments.map(c => c.user_id))]

    // Fetch profiles for these users
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds)

    // Create a map for quick lookup
    const profileMap = new Map(
        (profiles || []).map(p => [p.id, { display_name: p.display_name, email: p.email }])
    )

    // Attach profiles to comments
    return comments.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id) || null,
    }))
}

export async function addComment(promptId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to comment' }
    }

    if (!content.trim()) {
        return { error: 'Comment cannot be empty' }
    }

    const { data, error } = await supabase
        .from('comments')
        .insert({
            prompt_id: promptId,
            user_id: user.id,
            content: content.trim(),
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/feed')
    revalidatePath('/dashboard')
    return { success: true, comment: data }
}

export async function deleteComment(commentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to delete a comment' }
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/feed')
    revalidatePath('/dashboard')
    return { success: true }
}
