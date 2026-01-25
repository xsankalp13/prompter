'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PromptFormData, PromptWithCreator, Prompt, Vote } from '@/types/database'

const PROMPTS_PER_PAGE = 12

export async function createPrompt(data: PromptFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to create a prompt' }
    }

    // Insert the prompt first
    const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .insert({
            title: data.title,
            content: data.content,
            category: data.category,
            user_id: user.id,
        })
        .select()
        .single()

    if (promptError) {
        return { error: promptError.message }
    }

    // Handle tags if provided
    if (data.tags && data.tags.length > 0) {
        // Upsert tags (insert if not exists)
        for (const tagName of data.tags) {
            // Try to get existing tag or create new one
            const { data: existingTag } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName.toLowerCase())
                .single()

            let tagId: string

            if (existingTag) {
                tagId = existingTag.id
            } else {
                const { data: newTag, error: tagError } = await supabase
                    .from('tags')
                    .insert({ name: tagName.toLowerCase() })
                    .select()
                    .single()

                if (tagError) {
                    console.error('Error creating tag:', tagError)
                    continue
                }
                tagId = newTag.id
            }

            // Link tag to prompt
            await supabase
                .from('prompt_tags')
                .insert({
                    prompt_id: prompt.id,
                    tag_id: tagId,
                })
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/feed')
    return { success: true }
}

export async function updatePrompt(id: string, data: Partial<PromptFormData>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to update a prompt' }
    }

    const { error } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/feed')
    return { success: true }
}

export async function deletePrompt(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to delete a prompt' }
    }

    const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/feed')
    return { success: true }
}

// Helper function to fetch profiles for prompts
async function attachProfilesToPrompts(
    supabase: Awaited<ReturnType<typeof createClient>>,
    prompts: Prompt[]
): Promise<PromptWithCreator[]> {
    if (prompts.length === 0) return []

    // Get unique user IDs
    const userIds = [...new Set(prompts.map(p => p.user_id))]

    // Fetch profiles for these users
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds)

    // Create a map for quick lookup
    const profileMap = new Map(
        (profiles || []).map(p => [p.id, { display_name: p.display_name, email: p.email }])
    )

    // Attach profiles to prompts
    return prompts.map(prompt => ({
        ...prompt,
        profiles: profileMap.get(prompt.user_id) || null,
    }))
}

// Helper function to fetch tags for prompts
async function attachTagsToPrompts(
    supabase: Awaited<ReturnType<typeof createClient>>,
    prompts: PromptWithCreator[]
): Promise<PromptWithCreator[]> {
    if (prompts.length === 0) return []

    const promptIds = prompts.map(p => p.id)

    // Fetch all prompt_tags for these prompts
    const { data: promptTags } = await supabase
        .from('prompt_tags')
        .select('prompt_id, tag_id')
        .in('prompt_id', promptIds)

    if (!promptTags || promptTags.length === 0) {
        return prompts.map(p => ({ ...p, tags: [] }))
    }

    // Get unique tag IDs
    const tagIds = [...new Set(promptTags.map(pt => pt.tag_id))]

    // Fetch tag names
    const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', tagIds)

    // Create tag name map
    const tagNameMap = new Map((tags || []).map(t => [t.id, t.name]))

    // Group tags by prompt
    const promptTagsMap = new Map<string, string[]>()
    for (const pt of promptTags) {
        const tagName = tagNameMap.get(pt.tag_id)
        if (tagName) {
            const existing = promptTagsMap.get(pt.prompt_id) || []
            existing.push(tagName)
            promptTagsMap.set(pt.prompt_id, existing)
        }
    }

    // Attach tags to prompts
    return prompts.map(p => ({
        ...p,
        tags: promptTagsMap.get(p.id) || [],
    }))
}

export async function getPrompts(
    page: number = 1,
    category?: string,
    search?: string
): Promise<{ prompts: PromptWithCreator[]; hasMore: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
        .from('prompts')
        .select('*')
        .order('vote_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * PROMPTS_PER_PAGE, page * PROMPTS_PER_PAGE)

    if (category && category !== 'all') {
        query = query.eq('category', category)
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: prompts, error } = await query

    if (error) {
        console.error('Error fetching prompts:', error)
        return { prompts: [], hasMore: false }
    }

    const promptsArray = prompts as Prompt[]
    const hasMore = promptsArray.length > PROMPTS_PER_PAGE
    const promptsToProcess = hasMore ? promptsArray.slice(0, PROMPTS_PER_PAGE) : promptsArray

    if (promptsToProcess.length === 0) {
        return { prompts: [], hasMore: false }
    }

    const [promptsWithProfiles, votesResult, promptsWithTags] = await Promise.all([
        attachProfilesToPrompts(supabase, promptsToProcess),
        (user)
            ? supabase
                .from('votes')
                .select('prompt_id, vote_type')
                .eq('user_id', user.id)
                .in('prompt_id', promptsToProcess.map(p => p.id))
            : Promise.resolve({ data: [] }),
        attachTagsToPrompts(supabase, promptsToProcess as unknown as PromptWithCreator[])
    ])

    // Merge results
    let finalPrompts = promptsWithProfiles

    // Merge votes
    if (votesResult.data && votesResult.data.length > 0) {
        const voteMap = new Map((votesResult.data as Pick<Vote, 'prompt_id' | 'vote_type'>[]).map(v => [v.prompt_id, v.vote_type]))
        finalPrompts = finalPrompts.map(p => ({
            ...p,
            user_vote: voteMap.get(p.id) || null,
        }))
    }

    // Merge tags
    finalPrompts = finalPrompts.map((p, i) => ({
        ...p,
        tags: promptsWithTags[i].tags
    }))

    return {
        prompts: finalPrompts,
        hasMore,
    }
}

export async function getUserPrompts(
    category?: string,
    search?: string
): Promise<PromptWithCreator[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let query = supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (category && category !== 'all') {
        query = query.eq('category', category)
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: prompts, error } = await query

    if (error) {
        console.error('Error fetching user prompts:', error)
        return []
    }

    // Attach profiles to prompts
    let promptsWithProfiles = await attachProfilesToPrompts(supabase, prompts as Prompt[])

    // Get user votes
    const { data: votes } = await supabase
        .from('votes')
        .select('prompt_id, vote_type')
        .eq('user_id', user.id)

    const voteMap = new Map((votes || []).map(v => [v.prompt_id, v.vote_type]))

    promptsWithProfiles = promptsWithProfiles.map(p => ({
        ...p,
        user_vote: voteMap.get(p.id) || null,
    }))

    // Attach tags to prompts
    promptsWithProfiles = await attachTagsToPrompts(supabase, promptsWithProfiles)

    return promptsWithProfiles
}

export async function getPromptById(id: string): Promise<PromptWithCreator | null> {
    const supabase = await createClient()

    const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching prompt:', error)
        return null
    }

    // Fetch profile for this prompt
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', prompt.user_id)
        .single()

    // Fetch tags for this prompt
    const { data: promptTags } = await supabase
        .from('prompt_tags')
        .select('tag_id')
        .eq('prompt_id', id)

    let tags: string[] = []
    if (promptTags && promptTags.length > 0) {
        const tagIds = promptTags.map(pt => pt.tag_id)
        const { data: tagData } = await supabase
            .from('tags')
            .select('name')
            .in('id', tagIds)

        tags = (tagData || []).map(t => t.name)
    }

    return {
        ...prompt,
        profiles: profile || null,
        tags,
    } as PromptWithCreator
}

export async function vote(promptId: string, voteType: 1 | -1) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to vote' }
    }

    // Check if already voted
    const { data: existing } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single()

    if (existing) {
        if (existing.vote_type === voteType) {
            // Same vote type - remove the vote
            const { error } = await supabase
                .from('votes')
                .delete()
                .eq('id', existing.id)

            if (error) {
                return { error: error.message }
            }

            revalidatePath('/dashboard')
            revalidatePath('/feed')
            revalidatePath(`/prompt/${promptId}`)
            return { success: true, newVote: null }
        } else {
            // Different vote type - update the vote
            const { error } = await supabase
                .from('votes')
                .update({ vote_type: voteType })
                .eq('id', existing.id)

            if (error) {
                return { error: error.message }
            }

            revalidatePath('/dashboard')
            revalidatePath('/feed')
            revalidatePath(`/prompt/${promptId}`)
            return { success: true, newVote: voteType }
        }
    } else {
        // New vote
        const { error } = await supabase
            .from('votes')
            .insert({
                user_id: user.id,
                prompt_id: promptId,
                vote_type: voteType,
            })

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/dashboard')
        revalidatePath('/feed')
        revalidatePath(`/prompt/${promptId}`)
        return { success: true, newVote: voteType }
    }
}

export async function getCategories(): Promise<string[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('prompts')
        .select('category')
        .order('category')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    // Get unique categories
    const categories = [...new Set((data as { category: string }[]).map(p => p.category))]
    return categories
}
