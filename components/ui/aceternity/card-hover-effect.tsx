'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export function HoverEffect({
    items,
    className,
}: {
    items: {
        title: string
        description: string
        icon?: React.ReactNode
        link?: string
    }[]
    className?: string
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div
            className={cn(
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
                className
            )}
        >
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="relative group block h-full w-full p-2"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <Card>
                        <div className="flex items-center gap-3 mb-3">
                            {item.icon && (
                                <div className="text-violet-400">{item.icon}</div>
                            )}
                            <CardTitle>{item.title}</CardTitle>
                        </div>
                        <CardDescription>{item.description}</CardDescription>
                    </Card>
                </div>
            ))}
        </div>
    )
}

function Card({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <div
            className={cn(
                'rounded-2xl h-full w-full overflow-hidden bg-card border border-border backdrop-blur-sm relative z-20 p-6',
                className
            )}
        >
            {children}
        </div>
    )
}

function CardTitle({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <h4 className={cn('text-card-foreground font-semibold tracking-tight', className)}>
            {children}
        </h4>
    )
}

function CardDescription({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <p
            className={cn(
                'text-muted-foreground text-sm leading-relaxed',
                className
            )}
        >
            {children}
        </p>
    )
}
