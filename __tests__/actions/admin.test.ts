import { getPromptStats } from '@/actions/admin'
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

describe('getPromptStats action', () => {
  const mockUser = createMockUser({ id: 'admin-user' })

  const mockRpc = jest.fn()
  const mockFrom = jest.fn()
  const mockAuthGetUser = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
      rpc: mockRpc,
    })
  })

  it('should return null if user is not admin', async () => {
     // Mock user check returning a user
     mockAuthGetUser.mockResolvedValue({ data: { user: mockUser } })

     // Mock profile check to return 'user' role
     const mockSingle = jest.fn().mockResolvedValue({ data: { role: 'user' } })
     const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
     const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })

     mockFrom.mockReturnValue({ select: mockSelect })

     const result = await getPromptStats()
     expect(result).toBeNull()
  })

  it('should return stats if user is admin', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: mockUser } })

    // We need to implement a smarter mock for `from` to handle different tables

    const mockQueryBuilderPrompts = {
        select: jest.fn().mockImplementation((query, options) => {
             if (options?.count) return Promise.resolve({ count: 100 }) // Total prompts
             return {
                 order: jest.fn().mockReturnValue({
                     limit: jest.fn().mockResolvedValue({ data: [] }) // Recent prompts
                 })
             }
        }),
    }

    const mockQueryBuilderProfiles = {
         select: jest.fn().mockImplementation((query, options) => {
             if (query === 'role') {
                  return {
                      eq: jest.fn().mockReturnValue({
                          single: jest.fn().mockResolvedValue({ data: { role: 'admin' } })
                      })
                  }
             }
             if (options?.count) return Promise.resolve({ count: 50 }) // Total users
             return Promise.resolve({ data: [] })
         })
    }

    mockFrom.mockImplementation((table) => {
        if (table === 'prompts') return mockQueryBuilderPrompts
        if (table === 'profiles') return mockQueryBuilderProfiles
        return { select: jest.fn() }
    })

    // Mock RPC
    const mockCategoryStats = [
        { category: 'Coding', count: 10 },
        { category: 'Writing', count: 5 }
    ]
    mockRpc.mockResolvedValue({ data: mockCategoryStats })

    const result = await getPromptStats()

    expect(result).not.toBeNull()
    expect(result?.totalPrompts).toBe(100)
    expect(result?.totalUsers).toBe(50)
    expect(result?.topCategories).toHaveLength(2)
    expect(result?.topCategories[0]).toEqual({ name: 'Coding', count: 10 })
    expect(mockRpc).toHaveBeenCalledWith('get_category_stats')
  })
})
