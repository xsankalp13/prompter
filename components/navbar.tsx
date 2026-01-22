'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut } from '@/actions/auth'
import { Menu, X, Sparkles, User, Shield, LogOut } from 'lucide-react'
import { useState } from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import type { Profile } from '@/types/database'

interface NavbarProps {
    user: Profile | null
}

const navLinks = [
    { href: '/feed', label: 'Explore' },
    { href: '/dashboard', label: 'Dashboard', protected: true },
]

export function Navbar({ user }: NavbarProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const visibleLinks = navLinks.filter(
        link => !link.protected || user
    )

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-foreground/90">PromptVault</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-6">
                        {visibleLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-xs font-medium tracking-wide transition-colors hover:text-foreground',
                                    pathname === link.href
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex md:items-center md:gap-3">
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-0 focus-visible:ring-0">
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                                                {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-sm border-border bg-popover p-1 text-popover-foreground shadow-2xl backdrop-blur-3xl">
                                    <div className="px-2 py-1.5">
                                        <p className="text-xs font-medium text-foreground">{user.display_name}</p>
                                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem asChild className="rounded-sm focus:bg-accent focus:text-accent-foreground">
                                        <Link href="/dashboard" className="cursor-pointer text-xs">
                                            <User className="mr-2 h-3.5 w-3.5" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem asChild className="rounded-sm focus:bg-accent focus:text-accent-foreground">
                                            <Link href="/admin" className="cursor-pointer text-xs">
                                                <Shield className="mr-2 h-3.5 w-3.5" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="cursor-pointer rounded-sm text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-3.5 w-3.5" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="h-8 px-3 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground">
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button asChild className="h-8 rounded-sm bg-primary px-4 text-xs font-medium text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90">
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5 text-foreground" />
                        ) : (
                            <Menu className="h-5 w-5 text-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border bg-background md:hidden overflow-hidden"
                    >
                        <div className="space-y-1 px-4 py-4">
                            {visibleLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'block rounded-sm px-3 py-2 text-sm font-medium',
                                        pathname === link.href
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground hover:bg-accent/50'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <div className="flex gap-2 pt-4">
                                    <Button variant="ghost" asChild className="flex-1 rounded-sm border border-border text-xs">
                                        <Link href="/login">Log In</Link>
                                    </Button>
                                    <Button asChild className="flex-1 rounded-sm bg-primary text-xs text-primary-foreground">
                                        <Link href="/signup">Sign Up</Link>
                                    </Button>
                                    <div className="flex justify-center pt-2">
                                        <ModeToggle />
                                    </div>
                                </div>
                            )}
                            {user && (
                                <div className="pt-4 flex justify-start">
                                    <ModeToggle />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
