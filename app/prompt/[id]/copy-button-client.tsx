'use client'

import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

interface CopyButtonClientProps {
    content: string
}

export function CopyButtonClient({ content }: CopyButtonClientProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            onClick={handleCopy}
            variant="outline"
            className="h-9 rounded-sm border-border text-sm font-medium gap-2"
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                </>
            )}
        </Button>
    )
}
