'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/tag-input'
import { createPrompt } from '@/actions/prompts'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

const promptSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    content: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt is too long'),
    category: z.string().min(1, 'Category is required').max(50, 'Category is too long'),
    tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
})

type PromptFormData = z.infer<typeof promptSchema>

interface PromptFormProps {
    onSuccess?: () => void
}

export function PromptForm({ onSuccess }: PromptFormProps) {
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<PromptFormData>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            tags: [],
        },
    })

    const onSubmit = (data: PromptFormData) => {
        startTransition(async () => {
            const result = await createPrompt(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Prompt created successfully!')
                reset()
                onSuccess?.()
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Title</Label>
                <Input
                    id="title"
                    placeholder="Enter a descriptive title"
                    className="h-10 rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 text-sm"
                    {...register('title')}
                />
                {errors.title && (
                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.title.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Category</Label>
                <Input
                    id="category"
                    placeholder="e.g., Coding, Writing, Marketing"
                    className="h-10 rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 text-sm"
                    {...register('category')}
                />
                {errors.category && (
                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.category.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tags</Label>
                <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                        <TagInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add tags (press Enter or comma)"
                            maxTags={10}
                        />
                    )}
                />
                {errors.tags && (
                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.tags.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Prompt Content</Label>
                <Textarea
                    id="content"
                    placeholder="Enter your prompt here..."
                    rows={6}
                    className="rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:ring-0 text-sm leading-relaxed max-h-[50vh] overflow-y-auto"
                    {...register('content')}
                />
                {errors.content && (
                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.content.message}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isPending}
                className="h-10 w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Creating...
                    </>
                ) : (
                    'Create Prompt'
                )}
            </Button>
        </form>
    )
}

