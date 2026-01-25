/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserPrompts } from '@/actions/prompts'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const DELAY = 50

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('getUserPrompts Benchmark', () => {
  const mockUser = { id: 'user-123' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('measures execution time', async () => {
    const mockPrompts = [
      { id: 'p1', user_id: 'user-123', title: 'Test Prompt 1', created_at: '2023-01-01', vote_count: 0 },
      { id: 'p2', user_id: 'user-123', title: 'Test Prompt 2', created_at: '2023-01-02', vote_count: 0 }
    ]
    const mockProfiles = [{ id: 'user-123', display_name: 'Tester', email: 'test@example.com' }]
    const mockVotes = [{ prompt_id: 'p1', vote_type: 1 }]
    const mockPromptTags = [{ prompt_id: 'p1', tag_id: 't1' }]
    const mockTags = [{ id: 't1', name: 'coding' }]

    // Chain builder to simulate Supabase query chain
    const createChain = (data: any, delayMs: number) => {
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            // Simulate the promise behavior
            then: (onfulfilled: any) => {
                return delay(delayMs).then(() => {
                    return onfulfilled({ data, error: null })
                })
            }
        }
    }

    const mockFrom = jest.fn((table: string) => {
        if (table === 'prompts') return createChain(mockPrompts, DELAY)
        if (table === 'profiles') return createChain(mockProfiles, DELAY)
        if (table === 'votes') return createChain(mockVotes, DELAY)
        if (table === 'prompt_tags') return createChain(mockPromptTags, DELAY)
        if (table === 'tags') return createChain(mockTags, DELAY)
        return createChain([], 0)
    })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: mockFrom,
    })

    const start = performance.now()
    const result = await getUserPrompts()
    const end = performance.now()

    console.log(`Execution time: ${end - start}ms`)

    expect(result).toHaveLength(2)
    // p1 should have profile, vote, and tag
    const p1 = result.find(p => p.id === 'p1')
    expect(p1?.profiles).toEqual({ display_name: 'Tester', email: 'test@example.com' })
    expect(p1?.user_vote).toEqual(1)
    expect(p1?.tags).toEqual(['coding'])

    // p2 should have profile, no vote, no tag
    const p2 = result.find(p => p.id === 'p2')
    expect(p2?.profiles).toEqual({ display_name: 'Tester', email: 'test@example.com' })
    expect(p2?.user_vote).toBeNull()
    expect(p2?.tags).toEqual([])
  })
})
