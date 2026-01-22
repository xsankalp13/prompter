import Link from 'next/link'
import { Sparkles, Zap, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import { InfiniteMovingCards } from '@/components/ui/aceternity/infinite-moving-cards'
import { HoverEffect } from '@/components/ui/aceternity/card-hover-effect'
import { getUserProfile } from '@/actions/auth'
import { Navbar } from '@/components/navbar'

const samplePrompts = [
  {
    title: 'Code Review Assistant',
    content: 'Review this code for best practices, potential bugs, and performance improvements. Explain your findings clearly.',
    category: 'Coding',
  },
  {
    title: 'Blog Post Generator',
    content: 'Write a comprehensive blog post about [topic] that is engaging, informative, and SEO-optimized.',
    category: 'Writing',
  },
  {
    title: 'Marketing Email Template',
    content: 'Create a compelling marketing email for [product] that drives conversions and engagement.',
    category: 'Marketing',
  },
  {
    title: 'Data Analysis Helper',
    content: 'Analyze this dataset and provide insights, trends, and actionable recommendations.',
    category: 'Analytics',
  },
  {
    title: 'Creative Story Starter',
    content: 'Write an engaging opening paragraph for a [genre] story that hooks the reader immediately.',
    category: 'Creative',
  },
]

const features = [
  {
    title: 'Save & Organize',
    description: 'Store your favorite AI prompts in one place with custom categories for easy access.',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: 'Discover & Share',
    description: 'Browse a curated feed of prompts from the community and share your best creations.',
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: 'Lightning Fast',
    description: 'Copy prompts instantly and boost your AI workflow productivity.',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: 'Secure & Private',
    description: 'Your prompts are safe with enterprise-grade security and privacy controls.',
    icon: <Shield className="h-6 w-6" />,
  },
]

export default async function Home() {
  const user = await getUserProfile()

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      <BackgroundBeams className="opacity-40" />
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center rounded-sm border border-border bg-muted/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              The ultimate prompt collection platform
            </div>

            <TextGenerateEffect
              words="Collect, Share & Discover Amazing AI Prompts"
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
            />

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground font-light leading-relaxed">
              Build your personal library of powerful prompts. Browse community favorites.
              Supercharge your AI workflow.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-8 transition-transform hover:scale-[1.02]"
              >
                <Link href={user ? '/dashboard' : '/signup'}>
                  Start Collecting Prompts
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-sm border-border bg-background/50 hover:bg-accent hover:text-accent-foreground text-foreground text-sm font-medium px-8 transition-colors"
              >
                <Link href="/feed">
                  Explore Feed
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="relative py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Live Feed Preview
          </h2>
          <InfiniteMovingCards
            items={samplePrompts}
            direction="left"
            speed="slow"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to master prompts
            </h2>
            <p className="mt-4 text-muted-foreground font-light">
              A complete platform for prompt enthusiasts and professionals
            </p>
          </div>
          <HoverEffect items={features} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to level up your AI game?
          </h2>
          <p className="mt-4 text-muted-foreground font-light">
            Join thousands of users already building their prompt libraries
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-11 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-8 transition-transform hover:scale-[1.02]"
          >
            <Link href={user ? '/dashboard' : '/signup'}>
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">PromptVault</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              © 2024 PromptVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
