# Review Audit — The List (the-list-ashy-pi.vercel.app)

## Issues Found & Fixed

### Critical Bugs

#### 1. PIN validation inconsistency (CRITICAL)
- **Problem**: `lists/route.ts` (POST) validated `^\d{4}$` (4-digit PIN), but `verify-pin/route.ts`, `items/route.ts`, and `items/[itemId]/route.ts` validated `^[a-zA-Z0-9]{6}$` (6 alphanumeric). This made PIN-protected lists completely inaccessible — any PIN saved as 4-digit would fail verification against 6-char regex.
- **Fix**: Unified all PIN validation across 4 files to accept `4-6 alphanumeric characters` (`^[a-zA-Z0-9]{4,6}$`). Updated error messages for consistency.
- **Files**: `src/app/api/lists/route.ts`, `src/app/api/lists/[slug]/items/route.ts`, `src/app/api/lists/[slug]/items/[itemId]/route.ts`, `src/app/api/lists/[slug]/verify-pin/route.ts`

#### 2. "Add to a list" flow was broken
- **Problem**: Clicking "Add to a list" on an item detail page opened `AddItemModal` (a full create-item modal) instead of allowing the user to add the **current** item to a list. After creating a *new* item, it navigated to list creation with the new item ID — completely wrong UX.
- **Fix**: Replaced the modal with a direct navigation to `/lists/new?add={currentItemId}`. Removed the `AddItemModal` import from `ItemActions.tsx`.

#### 3. Movie quality bar inconsistency
- **Problem**: `AddItemModal` filtered movies at 8.0+ IMDB, while `AddContent` used 7.0+. Items added via the old modal had a higher bar than items added via the full add page.
- **Fix**: Updated `AddItemModal` to use 7.0+ matching `AddContent`.

### Missing Fields in Old Modal

#### 4. AddItemModal missing `genre` for movies
- **Problem**: `AddItemModal`'s `handleMovieSelect` didn't extract `Genre` from OMDB results. The `MovieSearchResult` type also lacked the `Genre` field.
- **Fix**: Added `Genre?: string` to `MovieSearchResult` type. Updated `handleMovieSelect` to extract the first genre from `result.Genre`.

#### 5. Book year parsing bug in AddItemModal
- **Problem**: `parseInt(result.volumeInfo.publishedDate)` on Google Books dates like "2020-01-01" returns NaN instead of 2020.
- **Fix**: Added `.substring(0, 4)` before parsing, matching the fix already in `AddContent`.

#### 6. Debounce timeout not properly cleaned up
- **Problem**: Both `AddItemModal` and `AddContent` used `let searchTimeout` (a function-scoped variable recreated every render) instead of `useRef`. This meant clearing the timeout on a previous render's variable was a no-op.
- **Fix**: Replaced with `const searchTimeoutRef = useRef()` for proper cleanup across renders.

### Missing Columns in Migration

#### 7. Database migration out of sync with code
- **Problem**: Migration `0001_schema.sql` was missing columns: `google_maps_link`, `genre`, `cuisine`, `must_try`, `city` on the `items` table, `edit_pin` on `lists`, and the entire `feedback` table.
- **Fix**: Created `0002_add_fields_to_items_lists.sql` migration with all missing columns and the `feedback` table.

### Navigation & Page Gaps

#### 8. No lists overview page
- **Problem**: The nav "Lists" link went directly to `/lists/new` (create page). There was no `/lists` page showing all available lists.
- **Fix**: Created `src/app/lists/page.tsx` — fetches all lists from the API, shows them in a nice card layout with item counts. Updated nav to link to `/lists`. Updated the "← All Lists" back link in list detail pages to point to `/lists`.

#### 9. Browse tab change missing cuisine filter reset
- **Problem**: `handleTabChange` reset `cityFilter`, `genreFilter`, and `minRating` but forgot `cuisineFilter`.
- **Fix**: Added `setCuisineFilter('')` to the tab change handler.

#### 10. Item detail page missing genre/cuisine display
- **Problem**: Item detail page showed `must_try` for food but didn't display `genre` for movies or `cuisine` for food items.
- **Fix**: Added conditional rendering for `item.genre` and `item.cuisine` on the detail page below the subtitle.

### Summary of All Changed Files

| File | Changes |
|---|---|
| `src/app/api/lists/route.ts` | PIN validation: 4-digit → 4-6 alphanumeric |
| `src/app/api/lists/[slug]/items/route.ts` | PIN regex fixed, error message |
| `src/app/api/lists/[slug]/items/[itemId]/route.ts` | PIN regex fixed |
| `src/app/api/lists/[slug]/verify-pin/route.ts` | PIN regex fixed, error message |
| `src/app/add/AddContent.tsx` | Debounce useRef fix |
| `src/app/browse/BrowseContent.tsx` | Added cuisineFilter reset on tab change |
| `src/app/items/[id]/ItemActions.tsx` | Fixed "Add to list" flow (now direct nav) |
| `src/app/items/[id]/page.tsx` | Added genre + cuisine display |
| `src/app/lists/page.tsx` | **NEW** — Lists overview page |
| `src/app/lists/[slug]/ListPageClient.tsx` | Back link → `/lists` |
| `src/app/lists/[slug]/page.tsx` | Added `dynamic = 'force-dynamic'` |
| `src/components/AddItemModal.tsx` | Quality bar 8.0→7.0, genre field, book year fix, debounce useRef |
| `src/components/Nav.tsx` | Lists link → `/lists` |
| `src/lib/types.ts` | Added `Genre?` to MovieSearchResult |
| `supabase/migrations/0002_add_fields_to_items_lists.sql` | **NEW** — Missing columns & feedback table |

### Build Status
- ✅ `npm run build` passes with no errors

### Remaining Nice-to-Haves (not critical)
- No "add to existing list" from item detail — user must create a new list or manually navigate
- No ability to update/delete items via UI (only lists support delete via PIN)
- No admin panel for feedback review
- No review moderation
