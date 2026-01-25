'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export function InfiniteMovingCards({
    items,
    direction = 'left',
    speed = 'normal',
    pauseOnHover = true,
    className,
}: {
    items: {
        title: string
        content: string
        category: string
    }[]
    direction?: 'left' | 'right'
    speed?: 'fast' | 'normal' | 'slow'
    pauseOnHover?: boolean
    className?: string
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLUListElement>(null)
    const [start, setStart] = useState(false)

    useEffect(() => {
        const scroller = scrollerRef.current
        if (!scroller) return

        // Duplication logic
        if (scroller.getAttribute('data-duplicated') !== 'true') {
            const scrollerWidth = scroller.scrollWidth
            const gap = parseInt(window.getComputedStyle(scroller).gap || '0')
            const scrollDistance = scrollerWidth + gap

            const scrollerContent = Array.from(scroller.children)
            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true)
                scroller.appendChild(duplicatedItem)
            })

            scroller.setAttribute('data-duplicated', 'true')
            scroller.style.setProperty('--scroll-distance', `-${scrollDistance}px`)
        }

        // Animation logic
        const getSpeedInPx = () => {
            switch (speed) {
                case 'fast':
                    return 50
                case 'normal':
                    return 30
                case 'slow':
                    return 15
                default:
                    return 30
            }
        }

        const styleDistance = scroller.style.getPropertyValue('--scroll-distance')
        const distance = Math.abs(parseFloat(styleDistance))

        if (distance) {
            const duration = distance / getSpeedInPx()
            scroller.style.setProperty('--animation-duration', `${duration}s`)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStart(true)
        }
    }, [direction, speed])

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
                className
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    'flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4',
                    start && 'animate-scroll',
                    pauseOnHover && 'hover:[animation-play-state:paused]'
                )}
                style={{
                    animationDirection: direction === 'right' ? 'reverse' : 'normal',
                }}
            >
                {items.map((item, idx) => (
                    <li
                        key={idx}
                        className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-border bg-card px-8 py-6 backdrop-blur-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                                {item.category}
                            </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                            {item.title}
                        </h3>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                            {item.content}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
