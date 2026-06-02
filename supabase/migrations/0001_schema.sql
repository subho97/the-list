-- The List Database Schema

-- Items table: movies, books, and food places
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('movie', 'book', 'food')),
  title text NOT NULL,
  creator text,
  year int,
  description text,
  image_url text,
  external_rating float,
  imdb_id text,
  external_link text,
  added_at timestamptz DEFAULT now(),
  added_by text DEFAULT 'Anonymous'
);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_added_at ON items(added_at DESC);

-- Lists table: curated collections
CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'Anonymous'
);

CREATE INDEX idx_lists_slug ON lists(slug);

-- List items: join table between lists and items
CREATE TABLE list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  note text,
  UNIQUE(list_id, item_id)
);

CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_list_items_item_id ON list_items(item_id);

-- Reviews: food place reviews with mandatory photo
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  photo_url text NOT NULL,
  reviewed_by text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_item_id ON reviews(item_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anyone can SELECT and INSERT, no UPDATE/DELETE for anonymous
CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add items"
  ON items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view lists"
  ON lists FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create lists"
  ON lists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view list items"
  ON list_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add list items"
  ON list_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);
