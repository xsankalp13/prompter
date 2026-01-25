export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'user' | 'admin'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    display_name: string | null
                    role: UserRole
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    display_name?: string | null
                    role?: UserRole
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    display_name?: string | null
                    role?: UserRole
                    created_at?: string
                }
            }
            prompts: {
                Row: {
                    id: string
                    title: string
                    content: string
                    category: string
                    user_id: string
                    is_favorite: boolean
                    favorite_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    category: string
                    user_id: string
                    is_favorite?: boolean
                    favorite_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    category?: string
                    user_id?: string
                    is_favorite?: boolean
                    favorite_count?: number
                    created_at?: string
                }
            }
            user_favorites: {
                Row: {
                    id: string
                    user_id: string
                    prompt_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prompt_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prompt_id?: string
                    created_at?: string
                }
            }
            tags: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            prompt_tags: {
                Row: {
                    id: string
                    prompt_id: string
                    tag_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    prompt_id: string
                    tag_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    prompt_id?: string
                    tag_id?: string
                    created_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    prompt_id: string
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    prompt_id: string
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    prompt_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    user_id: string
                    prompt_id: string
                    vote_type: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prompt_id: string
                    vote_type: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prompt_id?: string
                    vote_type?: number
                    created_at?: string
                }
            }
        }
        Functions: {
            get_category_stats: {
                Args: Record<string, never>
                Returns: { category: string; count: number }[]
            }
        }
    }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Prompt = Database['public']['Tables']['prompts']['Row']
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type PromptTag = Database['public']['Tables']['prompt_tags']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']

// Extended types with relations
export interface PromptWithCreator extends Prompt {
    profiles: Pick<Profile, 'display_name' | 'email'> | null
    tags?: string[]
    vote_count?: number
    user_vote?: number | null // 1 for upvote, -1 for downvote, null for no vote
}

export interface CommentWithAuthor extends Comment {
    profiles: Pick<Profile, 'display_name' | 'email'> | null
}

export interface PromptFormData {
    title: string
    content: string
    category: string
    tags?: string[]
}
