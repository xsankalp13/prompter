'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PromptWithCreator } from '@/types/database'

export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return (profile as { role: string } | null)?.role === 'admin'
}

export async function searchPromptById(id: string): Promise<PromptWithCreator | null> {
    const supabase = await createClient()

    // Verify admin status
    const adminCheck = await isAdmin()
    if (!adminCheck) {
        return null
    }

    const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error searching prompt:', error)
        return null
    }

    // Fetch profile for this prompt
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', prompt.user_id)
        .single()

    return {
        ...prompt,
        profiles: profile || null,
    } as PromptWithCreator
}

export async function deletePromptAsAdmin(id: string) {
    const supabase = await createClient()

    // Verify admin status
    const adminCheck = await isAdmin()
    if (!adminCheck) {
        return { error: 'Unauthorized: Admin access required' }
    }

    const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/feed')
    return { success: true }
}

export async function getPromptStats() {
    const supabase = await createClient()

    // Verify admin status
    const adminCheck = await isAdmin()
    if (!adminCheck) {
        return null
    }

    const [
        { count: totalPrompts },
        { count: totalUsers },
        { data: recentPrompts },
        { data: topCategories },
    ] = await Promise.all([
        supabase.from('prompts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
            .from('prompts')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        supabase.from('prompts').select('category'),
    ])

    // Count categories
    const categoryCounts: Record<string, number> = {}
    const categories = topCategories as { category: string }[] | null
    categories?.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    })

    const sortedCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

    return {
        totalPrompts: totalPrompts || 0,
        totalUsers: totalUsers || 0,
        recentPrompts: recentPrompts || [],
        topCategories: sortedCategories,
    }
}
