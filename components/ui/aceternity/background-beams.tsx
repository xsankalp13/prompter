'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function BackgroundBeams({ className }: { className?: string }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 h-full w-full overflow-hidden',
                className
            )}
        >
            <svg
                className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 800"
                fill="none"
            >
                <defs>
                    <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Animated beams */}
                <motion.line
                    x1="-200"
                    y1="200"
                    x2="1400"
                    y2="600"
                    stroke="url(#beam1)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                />
                <motion.line
                    x1="-200"
                    y1="400"
                    x2="1400"
                    y2="200"
                    stroke="url(#beam2)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 5, repeat: Infinity, repeatDelay: 2, delay: 1 }}
                />
                <motion.line
                    x1="0"
                    y1="800"
                    x2="1200"
                    y2="100"
                    stroke="url(#beam1)"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, repeatDelay: 1, delay: 2 }}
                />
            </svg>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
    )
}
