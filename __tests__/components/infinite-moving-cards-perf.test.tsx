import { render, act } from '@testing-library/react'
import { InfiniteMovingCards } from '../../components/ui/aceternity/infinite-moving-cards'
import React, { Profiler } from 'react'

const items = [
    { title: 'Title 1', content: 'Content 1', category: 'Cat 1' },
    { title: 'Title 2', content: 'Content 2', category: 'Cat 2' },
]

describe('InfiniteMovingCards Performance', () => {
    it('should measure renders over time', async () => {
        // Mock scrollWidth
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 500 })

        // Mock getComputedStyle
        window.getComputedStyle = jest.fn().mockImplementation(() => ({
            gap: '16px',
            getPropertyValue: () => ''
        }))

        let renderCount = 0
        const onRender = (id: string, phase: string) => {
             renderCount++
        }

        render(
            <Profiler id="cards" onRender={onRender}>
                <InfiniteMovingCards items={items} />
            </Profiler>
        )

        // Wait for animation to run
        await act(async () => {
            await new Promise(r => setTimeout(r, 200))
        })

        // Check for CSS class
        const list = document.querySelector('ul')
        expect(list).toHaveClass('animate-scroll')
        // Check style attribute directly to avoid getComputedStyle mock issues
        expect(list?.style.animationDirection).toBe('normal')
    })
})
