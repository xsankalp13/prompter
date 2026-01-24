'use client'

import { cn } from '@/lib/utils'
import { motion, useAnimationFrame } from 'framer-motion'
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
    const [scrollPosition, setScrollPosition] = useState(0)

    const getSpeed = () => {
        switch (speed) {
            case 'fast':
                return 1
            case 'normal':
                return 0.5
            case 'slow':
                return 0.25
            default:
                return 0.5
        }
    }

    useEffect(() => {
        if (scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children)
            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true)
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem)
                }
            })
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStart(true)
        }
    }, [])

    useAnimationFrame(() => {
        if (!scrollerRef.current || !start) return

        const scrollerWidth = scrollerRef.current.scrollWidth / 2
        const newPosition = direction === 'left'
            ? scrollPosition + getSpeed()
            : scrollPosition - getSpeed()

        if (Math.abs(newPosition) >= scrollerWidth) {
            setScrollPosition(0)
        } else {
            setScrollPosition(newPosition)
        }
    })

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
                    pauseOnHover && 'hover:[animation-play-state:paused]'
                )}
                style={{
                    transform: `translateX(-${scrollPosition}px)`,
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
