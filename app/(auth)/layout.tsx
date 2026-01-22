import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Subtle background glow */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/10,transparent_70%)]" />

            <div className="relative w-full max-w-sm z-10">
                <div className="rounded-sm border border-border bg-card/80 p-8 backdrop-blur-xl shadow-2xl">
                    {children}
                </div>
            </div>
            <Toaster />
        </div>
    )
}
