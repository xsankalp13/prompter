// Polyfill TextEncoder/TextDecoder before imports
import { TextEncoder, TextDecoder } from 'util'
Object.assign(global, { TextEncoder, TextDecoder })

// Mock next/cache BEFORE require
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getPrompts } = require('@/actions/prompts')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@/lib/supabase/server')

const LATENCY_MS = 100

describe('getPrompts benchmark', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Helpers to simulate latency
    const withLatency = async (data: unknown) => {
      await new Promise(resolve => setTimeout(resolve, LATENCY_MS))
      return { data, error: null }
    }

    // Prompts data
    const mockPrompts = Array.from({ length: 12 }, (_, i) => ({
      id: `prompt-${i}`,
      title: `Prompt ${i}`,
      content: `Content ${i}`,
      category: 'coding',
      user_id: `user-${i % 3}`, // 3 users
      vote_count: 10,
      created_at: new Date().toISOString(),
    }))

    // Profiles data
    const mockProfiles = Array.from({ length: 3 }, (_, i) => ({
      id: `user-${i}`,
      display_name: `User ${i}`,
      email: `user${i}@example.com`,
    }))

    // Votes data
    const mockVotes = Array.from({ length: 5 }, (_, i) => ({
      prompt_id: `prompt-${i}`,
      vote_type: 1,
    }))

    // Tags data
    const mockPromptTags = Array.from({ length: 12 }, (_, i) => ({
      prompt_id: `prompt-${i}`,
      tag_id: `tag-${i % 2}`,
    }))
    const mockTags = [
        { id: 'tag-0', name: 'react' },
        { id: 'tag-1', name: 'nextjs' }
    ]

    // Create specific builders for each table
    const promptsBuilder = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockImplementation(() => withLatency(mockPrompts)),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
    }

    const profilesBuilder = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockImplementation(() => withLatency(mockProfiles)),
    }

    const votesBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockImplementation(() => withLatency(mockVotes)),
    }

    const promptTagsBuilder = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockImplementation(() => withLatency(mockPromptTags)),
    }

    const tagsBuilder = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockImplementation(() => withLatency(mockTags)),
    }

    const mockFrom = jest.fn().mockImplementation((table: string) => {
        switch (table) {
            case 'prompts': return promptsBuilder
            case 'profiles': return profilesBuilder
            case 'votes': return votesBuilder
            case 'prompt_tags': return promptTagsBuilder
            case 'tags': return tagsBuilder
            default: return { select: jest.fn().mockReturnThis() }
        }
    })

    const mockAuthGetUser = jest.fn().mockResolvedValue({ data: { user: { id: 'current-user' } } })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
    })
  })

  test('measure getPrompts execution time and verify correctness', async () => {
    const start = performance.now()
    const result = await getPrompts(1, 'all', '')
    const end = performance.now()
    const duration = end - start

    console.log(`getPrompts execution time: ${duration.toFixed(2)}ms`)

    // Verify correctness
    expect(result.prompts).toHaveLength(12)
    expect(result.hasMore).toBe(false)

    // Check profiles attached
    // user_id for prompt-0 is user-0. Profile for user-0 exists.
    expect(result.prompts[0].profiles).toEqual({
        display_name: 'User 0',
        email: 'user0@example.com'
    })

    // Check votes attached
    // prompt-0 has a vote in mockVotes.
    expect(result.prompts[0].user_vote).toBe(1)
    // prompt-5 (index 5) does not have a vote (mockVotes length 5, prompt-0 to prompt-4)
    expect(result.prompts[5].user_vote).toBeNull()

    // Check tags attached
    // prompt-0 has tag-0 ('react')
    expect(result.prompts[0].tags).toContain('react')
    // prompt-1 has tag-1 ('nextjs')
    expect(result.prompts[1].tags).toContain('nextjs')
  })
})
