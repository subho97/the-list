// Auto-suggest cuisine based on place name keywords
const CUISINE_KEYWORDS: [string, string][] = [
  ['pizza', 'Pizza'],
  ['pasta', 'Italian'],
  ['italian', 'Italian'],
  ['sushi', 'Sushi'],
  ['japanese', 'Japanese'],
  ['ramen', 'Ramen'],
  ['noodle', 'Noodles'],
  ['dimsum', 'Dimsum'],
  ['dumpling', 'Dimsum'],
  ['momo', 'Momos'],
  ['gyoza', 'Gyoza'],
  ['thai', 'Thai'],
  ['vietnamese', 'Vietnamese'],
  ['korean', 'Korean'],
  ['burger', 'Burgers'],
  ['steak', 'Steak'],
  ['grill', 'Grill'],
  ['bbq', 'BBQ'],
  ['bakery', 'Bakery'],
  ['cake', 'Bakery'],
  ['pastry', 'Bakery'],
  ['coffee', 'Cafe'],
  ['cafe', 'Cafe'],
  ['brunch', 'Brunch'],
  ['tea', 'Tea'],
  ['indian', 'Indian'],
  ['curry', 'Indian'],
  ['tandoor', 'Indian'],
  ['north indian', 'North Indian'],
  ['south indian', 'South Indian'],
  ['paratha', 'North Indian'],
  ['naan', 'North Indian'],
  ['litti', 'Litti Chokha'],
  ['biryani', 'Biryani'],
  ['mediterranean', 'Mediterranean'],
  ['shawarma', 'Shawarma'],
  ['kebab', 'Kebab'],
  ['turkish', 'Turkish'],
  ['middle eastern', 'Middle Eastern'],
  ['egyptian', 'Middle Eastern'],
  ['mexican', 'Mexican'],
  ['taco', 'Mexican'],
  ['chinese', 'Chinese'],
  ['pan asian', 'Pan Asian'],
  ['seafood', 'Seafood'],
  ['street food', 'Street Food'],
  ['food truck', 'Food Truck'],
  ['chaat', 'Street Food'],
  ['pani puri', 'Street Food'],
  ['dessert', 'Dessert'],
  ['ice cream', 'Ice Cream'],
  ['sandwich', 'Sandwich'],
  ['waffle', 'Breakfast'],
  ['breakfast', 'Breakfast'],
  ['tibetian', 'Tibetan'],
  ['tibetan', 'Tibetan'],
];

export function suggestCuisine(title: string): string {
  const t = title.toLowerCase();
  for (const [keyword, cuisine] of CUISINE_KEYWORDS) {
    if (t.includes(keyword)) return cuisine;
  }
  return '';
}

export const ALL_CUISINES = [
  'Bakery', 'Burgers', 'Cafe', 'Dessert', 'Dimsum', 'Food Truck', 'Italian',
  'Japanese', 'Litti Chokha', 'Mediterranean', 'Middle Eastern', 'Momos',
  'North Indian', 'Pan Asian', 'Pizza', 'Ramen', 'Restaurant', 'Shawarma',
  'Steak', 'Street Food',
].sort();

export const ALL_CITIES = [
  'Bangalore', 'Mysore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Goa', 'Chandigarh',
  'Kochi', 'Thiruvananthapuram', 'Mangalore', 'Hubli', 'Udaipur', 'Jodhpur',
  'Amritsar', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Coimbatore',
  'Guwahati', 'Patna', 'Ranchi', 'Bhubaneswar', 'Dehradun', 'Srinagar',
  'Pondicherry', 'Panaji', 'Siliguri', 'Shimla', 'Manali', 'Leh',
].sort();
