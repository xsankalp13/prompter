-- PromptVault Row Level Security Policies
-- Run this AFTER schema.sql in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Anyone can read profiles (for displaying creator info)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- PROMPTS POLICIES
-- =====================

-- Anyone can read all prompts (public feed)
CREATE POLICY "Prompts are viewable by everyone"
  ON public.prompts FOR SELECT
  USING (true);

-- Authenticated users can create prompts
CREATE POLICY "Authenticated users can create prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prompts
CREATE POLICY "Users can update their own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prompts
CREATE POLICY "Users can delete their own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any prompt
CREATE POLICY "Admins can delete any prompt"
  ON public.prompts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================
-- USER_FAVORITES POLICIES
-- =====================

-- Users can see their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);
