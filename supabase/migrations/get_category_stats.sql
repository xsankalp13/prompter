CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (category text, count integer)
LANGUAGE sql
AS $$
  SELECT category, count(*)::integer as count
  FROM prompts
  GROUP BY category
  ORDER BY count DESC
  LIMIT 5;
$$;
