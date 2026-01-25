import { getPrompts } from '@/actions/prompts'
import { createClient } from '@/lib/supabase/server'
import { createMockUser } from '../utils/factories'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('getPrompts action', () => {
  const mockUser = createMockUser()

  // Setup Supabase mock chain
  const mockSelect = jest.fn()
  const mockOrder = jest.fn()
  const mockRange = jest.fn()
  const mockEq = jest.fn()
  const mockOr = jest.fn()
  const mockIn = jest.fn()
  const mockFrom = jest.fn()
  const mockAuthGetUser = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup query builder mocks
    // Note: getPrompts uses chaining: .select().order().order().range().[eq?].[or?]

    // We need to return the builder at each step
    const mockQueryBuilder = {
      select: mockSelect,
      order: mockOrder,
      range: mockRange,
      eq: mockEq,
      or: mockOr,
      in: mockIn,
    }

    mockFrom.mockReturnValue(mockQueryBuilder)
    mockSelect.mockReturnValue(mockQueryBuilder)
    mockOrder.mockReturnValue(mockQueryBuilder)
    mockRange.mockReturnValue(mockQueryBuilder)
    mockEq.mockReturnValue(mockQueryBuilder)
    mockOr.mockReturnValue(mockQueryBuilder)
    mockIn.mockReturnValue(mockQueryBuilder)

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
    })
  })

  it('should return PROMPTS_PER_PAGE items if available', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: mockUser } })

    // Create 13 dummy prompts (PROMPTS_PER_PAGE + 1)
    const dummyPrompts = Array.from({ length: 13 }, (_, i) => ({
      id: `prompt-${i}`,
      title: `Prompt ${i}`,
      content: `Content ${i}`,
      user_id: `user-${i}`,
      created_at: new Date().toISOString(),
      vote_count: 0,
    }))

    // Mock the final execution of the query which happens when awaiting the promise
    // In actual Supabase client, the builder is a promise-like object.
    // But here we are mocking the chain.
    // The code does: const { data: prompts, error } = await query
    // So the last function in the chain must return a promise that resolves to { data, error }

    // In getPrompts:
    // let query = supabase.from('prompts').select('*')...
    // if (category) query = query.eq(...)
    // const { data } = await query

    // So if we mock the chain, the LAST method called must return the promise.
    // In the default case: range() is the last one called before await if no category/search.

    mockRange.mockResolvedValue({ data: dummyPrompts, error: null })

    // We also need to mock subsequent calls for profiles, votes, tags
    // attachProfilesToPrompts calls .from('profiles').select().in()
    // attachTagsToPrompts calls .from('prompt_tags').select().in()
    // votes check calls .from('votes').select().eq().in()

    // Since we reuse mockFrom, we need to handle different table names
    mockFrom.mockImplementation((table) => {
      if (table === 'prompts') return { select: mockSelect }
      if (table === 'profiles') return {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [] })
        })
      }
      if (table === 'prompt_tags') return {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [] })
        })
      }
      if (table === 'votes') return {
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({ data: [] })
            })
        })
      }
      return { select: mockSelect }
    })

    const result = await getPrompts(1)

    // Should return 12 items (sliced) but hasMore should be true
    expect(result.prompts.length).toBe(12)
    expect(result.hasMore).toBe(true)
  })
})
