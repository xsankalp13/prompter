import { getPromptStats } from '@/actions/admin'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Benchmark getPromptStats', () => {
  const mockUser = { id: 'admin-user', email: 'admin@example.com' }

  // Generate large dataset
  const generateCategories = (count: number) => {
    const categories = ['AI', 'Writing', 'Code', 'Art', 'Music']
    return Array.from({ length: count }, () => ({
      category: categories[Math.floor(Math.random() * categories.length)],
    }))
  }

  const largeDataset = generateCategories(10000)

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    const mockAuthGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser } })

    // Mock for isAdmin check: profiles -> select -> eq -> single
    const mockProfileSingle = jest.fn().mockResolvedValue({ data: { role: 'admin' } })
    const mockProfileEq = jest.fn().mockReturnValue({ single: mockProfileSingle })
    // const mockProfileSelect = jest.fn().mockReturnValue({ eq: mockProfileEq })

    // Mock for totalPrompts: select(*, count)
    const mockTotalPrompts = jest.fn().mockResolvedValue({ count: 100 })

    // Mock for totalUsers: select(*, count)
    const mockTotalUsers = jest.fn().mockResolvedValue({ count: 50 })

    // Mock for recentPrompts: select -> order -> limit
    const mockRecentLimit = jest.fn().mockResolvedValue({ data: [] })
    const mockRecentOrder = jest.fn().mockReturnValue({ limit: mockRecentLimit })
    // const mockRecentSelect = jest.fn().mockReturnValue({ order: mockRecentOrder })

    // Mock for topCategories (Current Implementation)
    const mockCategoriesSelect = jest.fn().mockResolvedValue({ data: largeDataset })

    // Mock for topCategories (Optimized RPC)
    const mockRpcResponse = [
        { category: 'AI', count: 2000 },
        { category: 'Writing', count: 1900 },
        { category: 'Code', count: 1800 },
        { category: 'Art', count: 1700 },
        { category: 'Music', count: 1600 },
    ]
    const mockRpc = jest.fn().mockResolvedValue({ data: mockRpcResponse, error: null })

    // Mock .from() dispatching
    const mockFrom = jest.fn((table: string) => {
        if (table === 'profiles') {
             // For isAdmin check
             return { select: jest.fn((cols, opts) => {
                 if (opts?.count) return mockTotalUsers // For totalUsers
                 return { eq: mockProfileEq } // For isAdmin
             }) }
        }
        if (table === 'prompts') {
            return {
                select: jest.fn((cols, opts) => {
                    if (opts?.count) return mockTotalPrompts // For totalPrompts
                    if (cols === 'category') return mockCategoriesSelect() // For categories
                    return { order: mockRecentOrder } // For recent prompts
                }),
                delete: jest.fn()
            }
        }
        return {}
    })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
      rpc: mockRpc,
    })
  })

  it('measures processing time for RPC call', async () => {
    const start = performance.now()
    const stats = await getPromptStats()
    const end = performance.now()

    if (!stats) throw new Error('Stats should not be null')

    console.log(`Processing time (RPC): ${(end - start).toFixed(2)}ms`)
    expect(stats.topCategories.length).toBe(5)
    expect(stats.topCategories[0]).toEqual({ name: 'AI', count: 2000 })
  })
})
