import { deletePrompt } from '@/actions/prompts'
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

describe('deletePrompt action', () => {
  const mockUser = createMockUser()

  // Setup Supabase mock chain
  const mockDelete = jest.fn()
  const mockEq = jest.fn()
  const mockFrom = jest.fn()
  const mockAuthGetUser = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default successful response
    mockDelete.mockReturnValue({ error: null })
    mockEq.mockReturnValue({ delete: mockDelete, eq: mockEq }) // Handling chaining
    mockFrom.mockReturnValue({ delete: mockDelete, eq: mockEq }) // Incorrect chaining, let's fix

    // Correct Supabase query chain: supabase.from().delete().eq()
    // OR supabase.from().delete().match() etc.
    // Based on actual code: supabase.from('prompts').delete().eq('id', id)

    // Setup chain
    const mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    }

    mockFrom.mockReturnValue(mockQueryBuilder)

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
    })
  })

  it('should return error if user is not logged in', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null } })

    const result = await deletePrompt('prompt-1')

    expect(result).toEqual({ error: 'You must be logged in to delete a prompt' })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('should delete prompt if user is logged in', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: mockUser } })

    // Re-setup specific mock for this test
    const mockEq = jest.fn().mockResolvedValue({ error: null })
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
    const mockFrom = jest.fn().mockReturnValue({ delete: mockDelete })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
    })

    const result = await deletePrompt('prompt-1')

    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith('prompts')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('id', 'prompt-1')
  })

  it('should return error if deletion fails', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: mockUser } })

    // Mock failure
    const mockEq = jest.fn().mockResolvedValue({ error: { message: 'DB Error' } })
    const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
    const mockFrom = jest.fn().mockReturnValue({ delete: mockDelete })

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: mockAuthGetUser,
      },
      from: mockFrom,
    })

    const result = await deletePrompt('prompt-1')

    expect(result).toEqual({ error: 'DB Error' })
  })
})
