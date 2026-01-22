'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpotlightProps {
    className?: string
    fill?: string
}

export function Spotlight({ className, fill = 'white' }: SpotlightProps) {
    const divRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!divRef.current) return
            const { left, top } = divRef.current.getBoundingClientRect()
            mouseX.set(e.clientX - left)
            mouseY.set(e.clientY - top)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div
            ref={divRef}
            className={cn(
                'pointer-events-none absolute inset-0 overflow-hidden',
                className
            )}
        >
            <motion.div
                className="absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${fill}15,
              transparent 80%
            )
          `,
                }}
            />
            <svg
                className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 stroke-[1] opacity-50"
                fill="none"
                viewBox="0 0 400 400"
            >
                <defs>
                    <radialGradient
                        id="spotlightGradient"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                    >
                        <stop offset="0%" stopColor={fill} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={fill} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <motion.ellipse
                    cx="200"
                    cy="200"
                    rx="200"
                    ry="200"
                    fill="url(#spotlightGradient)"
                    style={{
                        cx: useMotionTemplate`${mouseX}`,
                        cy: useMotionTemplate`${mouseY}`,
                    }}
                />
            </svg>
        </div>
    )
}

export function SpotlightCard({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const divRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return
        const { left, top } = divRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - left)
        mouseY.set(e.clientY - top)
    }

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={cn(
                'group relative rounded-xl border border-border bg-card p-8 backdrop-blur-sm',
                className
            )}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            {children}
        </div>
    )
}
