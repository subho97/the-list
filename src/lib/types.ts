export type ItemType = 'movie' | 'book' | 'food';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  creator: string | null;
  year: number | null;
  description: string | null;
  image_url: string | null;
  external_rating: number | null;
  imdb_id: string | null;
  external_link: string | null;
  google_maps_link: string | null;
  genre: string | null;
  cuisine: string | null;
  must_try: string | null;
  notes: string | null;
  purchase_link: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  added_at: string;
  added_by: string;
  upvotes: number;
  downvotes: number;
}

export interface List {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  created_by: string;
  is_private: boolean;
}

export interface ListItem {
  id: string;
  list_id: string;
  item_id: string;
  added_at: string;
  note: string | null;
}

export interface Review {
  id: string;
  item_id: string;
  rating: number;
  comment: string | null;
  photo_url: string;
  reviewed_by: string;
  created_at: string;
}

export interface MovieSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  imdbRating: string;
  Plot: string;
  Director: string;
  Genre?: string;
}

export interface BookSearchResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    averageRating?: number;
    infoLink?: string;
    categories?: string[];
  };
}
