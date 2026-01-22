'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp, signInWithGoogle } from '@/actions/auth'
import { useState, useTransition } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const authSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    displayName: z.string().min(1, 'Name is required').optional(),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
    mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    })

    const onSubmit = (data: AuthFormData) => {
        setError(null)
        const formData = new FormData()
        formData.append('email', data.email)
        formData.append('password', data.password)
        if (data.displayName) {
            formData.append('displayName', data.displayName)
        }

        startTransition(async () => {
            const result = mode === 'login'
                ? await signIn(formData)
                : await signUp(formData)

            if (result?.error) {
                setError(result.error)
            }
        })
    }

    const handleGoogleSignIn = () => {
        startTransition(async () => {
            const result = await signInWithGoogle()
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {mode === 'login' ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {mode === 'login'
                        ? 'Enter your credentials to access.'
                        : 'Start collecting amazing prompts.'}
                </p>
            </div>

            {error && (
                <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {mode === 'signup' && (
                    <div className="space-y-1.5">
                        <Label htmlFor="displayName" className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
                        <Input
                            id="displayName"
                            placeholder="John Doe"
                            className="h-10 rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 text-sm"
                            {...register('displayName')}
                        />
                        {errors.displayName && (
                            <p className="text-[10px] text-destructive font-medium mt-1">{errors.displayName.message}</p>
                        )}
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="h-10 rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 text-sm"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-[10px] text-destructive font-medium mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="h-10 rounded-sm bg-background border-border text-foreground placeholder:text-muted-foreground pr-10 focus:border-ring focus:ring-0 text-sm"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-[10px] text-destructive font-medium mt-1">{errors.password.message}</p>
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
                            {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                        </>
                    ) : (
                        mode === 'login' ? 'Sign In' : 'Create Account'
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isPending}
                className="h-10 w-full rounded-sm border-border bg-background text-foreground hover:bg-accent font-normal text-sm"
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
                {mode === 'login' ? (
                    <>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-foreground hover:underline decoration-foreground/30 underline-offset-4">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href="/login" className="text-foreground hover:underline decoration-foreground/30 underline-offset-4">
                            Sign in
                        </Link>
                    </>
                )}
            </p>
        </div>
    )
}
