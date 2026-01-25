CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (category text, count bigint)
LANGUAGE sql
AS $$
  SELECT category, count(*) as count
  FROM prompts
  GROUP BY category
  ORDER BY count DESC
  LIMIT 5;
$$;
