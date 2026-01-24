import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import QueryProvider from "@/components/providers/query-provider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PromptVault - Collect, Share & Discover AI Prompts",
  description: "Build your personal library of powerful prompts. Browse community favorites. Supercharge your AI workflow with PromptVault.",
  keywords: ["AI prompts", "prompt library", "ChatGPT prompts", "AI tools", "prompt engineering"],
  openGraph: {
    title: "PromptVault - Collect, Share & Discover AI Prompts",
    description: "Build your personal library of powerful prompts. Browse community favorites. Supercharge your AI workflow.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
