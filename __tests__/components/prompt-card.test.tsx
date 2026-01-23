import { render, screen, fireEvent } from '@testing-library/react'
import { PromptCard } from '@/components/prompt-card'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock actions/prompts
jest.mock('@/actions/prompts', () => ({
  deletePrompt: jest.fn(),
}))

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock VoteButtons
jest.mock('@/components/vote-buttons', () => ({
  VoteButtons: () => <div data-testid="vote-buttons">VoteButtons</div>,
}))

describe('PromptCard', () => {
  const mockPrompt = {
    id: '1',
    title: 'Test Prompt',
    content: 'This is a test prompt content',
    category: 'Coding',
    user_id: 'user1',
    is_favorite: false,
    favorite_count: 0,
    created_at: '2023-01-01',
    profiles: {
      display_name: 'Test Author',
      email: 'author@example.com',
    },
    tags: ['react', 'testing'],
    vote_count: 10,
    user_vote: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders prompt details', () => {
    render(<PromptCard prompt={mockPrompt} />)

    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
    expect(screen.getByText('This is a test prompt content')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
  })

  it('navigates to prompt details on click', () => {
    render(<PromptCard prompt={mockPrompt} />)

    fireEvent.click(screen.getByText('Test Prompt'))
    expect(mockPush).toHaveBeenCalledWith('/prompt/1')
  })
})
