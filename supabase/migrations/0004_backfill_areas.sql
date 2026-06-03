-- Backfill area data for existing food entries in Bangalore
-- Based on known locations of these establishments

-- HSR Layout
UPDATE items SET area = 'HSR Layout' WHERE type = 'food' AND title = 'KRIED Food Truck';
UPDATE items SET area = 'HSR Layout' WHERE type = 'food' AND title = 'Do by Folki Food Truck';
UPDATE items SET area = 'HSR Layout' WHERE type = 'food' AND title = 'Roti Kulcha Naam';
UPDATE items SET area = 'HSR Layout' WHERE type = 'food' AND title = 'Pani Puri Street Stall';

-- Koramangala
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Al Amanah';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Al Taza';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Mama Goto';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Dalmoros';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Tycoons';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Krok Burgers';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Tuk Tuk Pizzeria';
UPDATE items SET area = 'Koramangala' WHERE type = 'food' AND title = 'Pizza No Cap';

-- Indiranagar
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Kopitiam Lah';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Bambeys Cafe';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Millers 46 Steak House';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Spettacolare';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Haka';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Litti Heist';
UPDATE items SET area = 'Indiranagar' WHERE type = 'food' AND title = 'Steamio';

-- BTM Layout
UPDATE items SET area = 'BTM Layout' WHERE type = 'food' AND title = 'Wah Punjabi';
UPDATE items SET area = 'BTM Layout' WHERE type = 'food' AND title = 'Jai Mata Di Litti Choka';
UPDATE items SET area = 'BTM Layout' WHERE type = 'food' AND title = 'Hey Habibi';

-- JP Nagar
UPDATE items SET area = 'JP Nagar' WHERE type = 'food' AND title = 'Mad Doh';
UPDATE items SET area = 'JP Nagar' WHERE type = 'food' AND title = 'Sign Laban';
UPDATE items SET area = 'JP Nagar' WHERE type = 'food' AND title = 'Tenzin Kitchen';

-- Kalyan Nagar / Kammanahalli
UPDATE items SET area = 'Kalyan Nagar' WHERE type = 'food' AND title = 'Harleys Fine Baking';
UPDATE items SET area = 'Kalyan Nagar' WHERE type = 'food' AND title = 'Ramen Food Truck';
UPDATE items SET area = 'Kalyan Nagar' WHERE type = 'food' AND title = 'Mai Mai';
UPDATE items SET area = 'Kalyan Nagar' WHERE type = 'food' AND title = 'Koteshwara - The Temple of Divine Food';

-- Whitefield
UPDATE items SET area = 'Whitefield' WHERE type = 'food' AND title = 'Bunco';

-- Mysore
UPDATE items SET area = 'Mysore City' WHERE type = 'food' AND city = 'Mysore' AND title = 'Sapa Bakery';
UPDATE items SET area = 'Mysore City' WHERE type = 'food' AND city = 'Mysore' AND title = 'The Local Friendly Bakery';
UPDATE items SET area = 'Mysore City' WHERE type = 'food' AND city = 'Mysore' AND title = 'White Teak Coffee Roasters';
