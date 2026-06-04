-- Add checked/done tracking for list items
-- Users can mark items as "done" (watched, read, visited) with a checkmark

ALTER TABLE list_items ADD COLUMN IF NOT EXISTS checked boolean DEFAULT false;
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS checked_at timestamptz;

-- Update RLS policy to allow updates on list_items
CREATE POLICY "Anyone can update list items"
  ON list_items FOR UPDATE
  USING (true)
  WITH CHECK (true);
