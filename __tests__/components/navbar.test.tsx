import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

// Mock actions/auth
jest.mock('@/actions/auth', () => ({
  signOut: jest.fn(),
}))

// Mock ModeToggle
jest.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle">ModeToggle</div>,
}))

describe('Navbar', () => {
  it('renders login and signup buttons when user is null', () => {
    render(<Navbar user={null} />)

    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    // Dashboard is protected, so it shouldn't be in the visible links
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders user avatar and dashboard link when user is logged in', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'user',
      created_at: '2023-01-01',
    } as any

    render(<Navbar user={user} />)

    // Avatar fallback should be rendered (first letter of display name)
    expect(screen.getByText('T')).toBeInTheDocument()

    // Dashboard should be visible in navigation links
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
  })
})
