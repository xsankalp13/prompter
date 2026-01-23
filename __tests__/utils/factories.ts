import type { Profile, PromptWithCreator } from '@/types/database'

export function createMockUser(overrides?: Partial<Profile>): Profile {
  return {
    id: 'user-123',
    email: 'test@example.com',
    display_name: 'Test User',
    role: 'user',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockPrompt(overrides?: Partial<PromptWithCreator>): PromptWithCreator {
  return {
    id: 'prompt-123',
    title: 'Test Prompt',
    content: 'This is a test prompt content',
    category: 'Coding',
    user_id: 'user-123',
    is_favorite: false,
    favorite_count: 0,
    created_at: new Date().toISOString(),
    profiles: {
      display_name: 'Test Author',
      email: 'author@example.com',
    },
    tags: ['react', 'testing'],
    vote_count: 10,
    user_vote: 1,
    ...overrides,
  }
}
