-- Migration: Add Votes System (replacing favorites)
-- Run this in your Supabase SQL Editor

-- Add vote_count column to prompts (replaces favorite_count)
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_prompt_id ON public.votes(prompt_id);

-- RLS Policies for Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create votes"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON public.votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update vote count on prompts
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prompts 
    SET vote_count = vote_count + NEW.vote_type 
    WHERE id = NEW.prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change (e.g., upvote to downvote)
    UPDATE public.prompts 
    SET vote_count = vote_count - OLD.vote_type + NEW.vote_type 
    WHERE id = NEW.prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prompts 
    SET vote_count = vote_count - OLD.vote_type 
    WHERE id = OLD.prompt_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for vote count
DROP TRIGGER IF EXISTS on_vote_change ON public.votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Optional: Migrate existing favorites to upvotes
-- INSERT INTO public.votes (user_id, prompt_id, vote_type)
-- SELECT user_id, prompt_id, 1 FROM public.user_favorites
-- ON CONFLICT (user_id, prompt_id) DO NOTHING;

-- Optional: Update vote_count from favorite_count
-- UPDATE public.prompts SET vote_count = favorite_count;
