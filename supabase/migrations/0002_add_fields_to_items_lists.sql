-- Migration 0002: Add new columns to items, add edit_pin to lists, add feedback table

-- Items: add new columns for enhanced metadata
ALTER TABLE items ADD COLUMN IF NOT EXISTS google_maps_link text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS genre text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS cuisine text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS must_try text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS city text;

CREATE INDEX IF NOT EXISTS idx_items_genre ON items(genre);
CREATE INDEX IF NOT EXISTS idx_items_cuisine ON items(cuisine);
CREATE INDEX IF NOT EXISTS idx_items_city ON items(city);

-- Lists: add edit_pin for PIN-protected editing
ALTER TABLE lists ADD COLUMN IF NOT EXISTS edit_pin text;

-- Feedback table: user-reported issues and suggestions
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  item_title text,
  feedback_type text NOT NULL,
  message text NOT NULL,
  contact text DEFAULT '',
  page_url text DEFAULT '',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  USING (true);
