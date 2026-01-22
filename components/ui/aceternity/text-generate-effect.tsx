'use client'

import { useEffect, useState } from 'react'
import { motion, stagger, useAnimate } from 'framer-motion'
import { cn } from '@/lib/utils'

export function TextGenerateEffect({
    words,
    className,
    filter = true,
    duration = 0.5,
}: {
    words: string
    className?: string
    filter?: boolean
    duration?: number
}) {
    const [scope, animate] = useAnimate()
    const wordsArray = words.split(' ')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            animate(
                'span',
                {
                    opacity: 1,
                    filter: filter ? 'blur(0px)' : 'none',
                },
                {
                    duration: duration,
                    delay: stagger(0.1),
                }
            )
        }
    }, [animate, duration, filter, mounted])

    if (!mounted) {
        return (
            <div className={className}>
                <span>{words}</span>
            </div>
        )
    }

    return (
        <div className={cn('font-bold', className)}>
            <div ref={scope}>
                {wordsArray.map((word, idx) => (
                    <motion.span
                        key={word + idx}
                        className="opacity-0"
                        style={{
                            filter: filter ? 'blur(10px)' : 'none',
                        }}
                    >
                        {word}{' '}
                    </motion.span>
                ))}
            </div>
        </div>
    )
}
