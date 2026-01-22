'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

interface AITestButtonsProps {
    promptContent: string
}

const AI_PLATFORMS = [
    {
        name: 'ChatGPT',
        logo: '/logos/chatgpt.webp',
        getUrl: (prompt: string) => `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`,
        color: 'bg-emerald-600 hover:bg-emerald-700',
        textColor: 'text-white'
    },
    {
        name: 'Gemini',
        logo: '/logos/gemini.png',
        getUrl: (prompt: string) => `https://gemini.google.com/app?text=${encodeURIComponent(prompt)}`,
        color: 'bg-blue-600 hover:bg-blue-700',
        textColor: 'text-white'
    },
    {
        name: 'Claude',
        logo: '/logos/claude.svg',
        getUrl: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
        color: 'bg-orange-600 hover:bg-orange-700',
        textColor: 'text-white'
    },
    {
        name: 'Grok',
        logo: '/logos/grok.webp',
        getUrl: (prompt: string) => `https://grok.x.ai/?text=${encodeURIComponent(prompt)}`,
        color: 'bg-slate-800 hover:bg-slate-900',
        textColor: 'text-white'
    },
    {
        name: 'DeepSeek',
        logo: '/logos/deepseek.webp',
        getUrl: (prompt: string) => `https://chat.deepseek.com/?q=${encodeURIComponent(prompt)}`,
        color: 'bg-purple-600 hover:bg-purple-700',
        textColor: 'text-white'
    },
]

export function AITestButtons({ promptContent }: AITestButtonsProps) {
    const handleClick = (platform: typeof AI_PLATFORMS[0]) => {
        // Copy prompt to clipboard first as a fallback
        navigator.clipboard.writeText(promptContent)

        // Open the AI platform
        window.open(platform.getUrl(promptContent), '_blank')

        toast.success(`Opening ${platform.name}...`, {
            description: 'Prompt copied to clipboard as backup',
        })
    }

    return (
        <div className="flex flex-wrap gap-2">
            {AI_PLATFORMS.map(platform => (
                <Button
                    key={platform.name}
                    onClick={() => handleClick(platform)}
                    variant="outline"
                    className="h-9 px-3 text-xs font-medium gap-2 border-border/50 bg-background hover:bg-muted/50 transition-all text-foreground"
                    title={`Test with ${platform.name}`}
                >
                    <div className="relative h-4 w-4 overflow-hidden rounded-sm">
                        <Image
                            src={platform.logo}
                            alt={platform.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {platform.name}
                </Button>
            ))}
        </div>
    )
}
