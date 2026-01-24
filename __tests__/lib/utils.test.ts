import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('c1', 'c2')
    expect(result).toBe('c1 c2')
  })

  it('should handle conditional classes', () => {
    const result = cn('c1', true && 'c2', false && 'c3')
    expect(result).toBe('c1 c2')
  })

  it('should handle arrays', () => {
    const result = cn(['c1', 'c2'])
    expect(result).toBe('c1 c2')
  })

  it('should merge tailwind classes using tailwind-merge', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })
})
