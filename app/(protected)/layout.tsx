import { Navbar } from '@/components/navbar'
import { getUserProfile } from '@/actions/auth'
import { Toaster } from '@/components/ui/sonner'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUserProfile()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar user={user} />
            <main className="relative pt-16">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
