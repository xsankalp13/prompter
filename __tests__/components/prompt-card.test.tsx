import { render, screen, fireEvent } from '@testing-library/react'
import { PromptCard } from '@/components/prompt-card'
import { createMockPrompt } from '../utils/factories'
import { useRouter } from 'next/navigation'

// Mock actions/prompts
jest.mock('@/actions/prompts', () => ({
  deletePrompt: jest.fn(),
}))

// Mock VoteButtons
jest.mock('@/components/vote-buttons', () => ({
  VoteButtons: () => <div data-testid="vote-buttons">VoteButtons</div>,
}))

describe('PromptCard', () => {
  const mockPrompt = createMockPrompt()
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
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
    expect(mockPush).toHaveBeenCalledWith(`/prompt/${mockPrompt.id}`)
  })
})
