-- Migration 0003: Add area column to items, add mood column if not exists

-- Items: add area column for food place neighborhoods
ALTER TABLE items ADD COLUMN IF NOT EXISTS area text;

CREATE INDEX IF NOT EXISTS idx_items_area ON items(area);

-- Also ensure mood column exists (some schemas may not have it from 0002)
ALTER TABLE items ADD COLUMN IF NOT EXISTS mood text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS purchase_link text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS idx_items_mood ON items(mood);
