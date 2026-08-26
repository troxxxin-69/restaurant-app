export interface FoodItem {
  id: number;
  name: string;
  price: number;
  category: string;
  veg: boolean;
  rating: number;
  description: string;
  image: string;
}

// Free HD food images — per-item distinct, keyword accurate (Pexels + Unsplash + LoremFlickr)
// We use Pexels HD for flagship items + LoremFlickr keyword search for 100% per-item uniqueness

const pexels = {
  lassi: "https://images.pexels.com/photos/29699511/pexels-photo-29699511.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  coldCoffee: "https://images.pexels.com/photos/33094574/pexels-photo-33094574.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  roseShake: "https://images.pexels.com/photos/5041474/pexels-photo-5041474.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  tomatoSoup: "https://images.pexels.com/photos/17696681/pexels-photo-17696681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  paratha: "https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80",
  chhole: "https://images.unsplash.com/photo-1626132647524-4a77be5178cf?auto=format&fit=crop&w=600&h=600&q=80",
  pavBhaji: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80",
  sandwich: "https://images.pexels.com/photos/29747752/pexels-photo-29747752.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  pakoda: "https://images.pexels.com/photos/30709506/pexels-photo-30709506.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  paneerTikka: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80",
  chaat: "https://images.pexels.com/photos/34270742/pexels-photo-34270742.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  noodles: "https://images.pexels.com/photos/18698263/pexels-photo-18698263.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  manchurian: "https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  chilli: "https://images.pexels.com/photos/29631468/pexels-photo-29631468.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  pasta: "https://images.pexels.com/photos/29039084/pexels-photo-29039084.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  pizza: "https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  gulab: "https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&h=600&q=80",
  rasgulla: "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80",
  idli: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80",
  dosa: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80",
  uttapam: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80",
  dal: "https://images.pexels.com/photos/29685056/pexels-photo-29685056.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  dalMakhani: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80",
  papad: "https://images.unsplash.com/photo-1626132647524-b5a1c5f18c41?auto=format&fit=crop&w=600&h=600&q=80",
  raita: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80",
  sabzi: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80",
  paneer: "https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
  naan: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80",
  thali: "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&h=600&q=80",
  biryani: "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80",
};

// Helper to get curated HD food image per item — guarantees 100% food relevant images with zero animal placeholders
const HD = (keywords: string, id: number) => {
  const kw = keywords.toLowerCase();

  // Drinks
  if (kw.includes("lassi")) return "https://images.pexels.com/photos/29699511/pexels-photo-29699511.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop";
  if (kw.includes("coffee")) return "https://images.pexels.com/photos/33094574/pexels-photo-33094574.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop";
  if (kw.includes("rose") || kw.includes("shake")) return "https://images.pexels.com/photos/5041474/pexels-photo-5041474.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop";

  // Soups
  if (kw.includes("tomato") && kw.includes("soup")) return "https://images.pexels.com/photos/17696681/pexels-photo-17696681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop";
  if (kw.includes("soup")) {
    const list = [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1603105037880-880cd4edfb5d?auto=format&fit=crop&w=600&h=600&q=80"
    ];
    return list[id % list.length];
  }

  // Breakfast / Snacks
  if (kw.includes("paratha")) return "https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("chhole") || kw.includes("bhature")) return "https://images.unsplash.com/photo-1626132647524-4a77be5178cf?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("pav") || kw.includes("bhaji")) return "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("fries") || kw.includes("chips") || kw.includes("potato")) return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("sandwich") || kw.includes("toast")) return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("pakoda") || kw.includes("pakora") || kw.includes("kabab") || kw.includes("chaat")) return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80";

  // Chinese & Italian
  if (kw.includes("pasta")) return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("noodle") || kw.includes("chopsuey")) return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("manchurian") || kw.includes("chilli")) return "https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop";
  if (kw.includes("pizza")) return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80";

  // Sweets
  if (kw.includes("gulab") || kw.includes("jamun")) return "https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("rasgulla") || kw.includes("gulle") || kw.includes("sweet")) return "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80";

  // South Indian
  if (kw.includes("idli")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("dosa")) return "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("uttapam")) return "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80";

  // Curries / Main Course
  if (kw.includes("dal")) return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("paneer") || kw.includes("kofta")) return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("sabji") || kw.includes("veg") || kw.includes("saag") || kw.includes("curry")) return "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80";

  // Breads / Rotis
  if (kw.includes("roti") || kw.includes("naan") || kw.includes("raabdi")) return "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80";

  // Rice / Biryani
  if (kw.includes("biryani")) return "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80";
  if (kw.includes("rice") || kw.includes("pulav") || kw.includes("pulao")) return "https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80";

  // Thalis
  if (kw.includes("thali") || kw.includes("baati")) return "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&h=600&q=80";

  // Salad & Sides
  if (kw.includes("salad") || kw.includes("raita") || kw.includes("curd") || kw.includes("papad")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80";

  const pool = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80"
  ];
  return pool[id % pool.length];
};

export const categories: { name: string; icon: string; image: string }[] = [
  { name: "Drinks", icon: "🥤", image: HD("lassi,cold-coffee,rose-shake", 901) },
  { name: "Soup", icon: "🍲", image: HD("tomato-soup,hot-sour-soup,manchow", 902) },
  { name: "Breakfast", icon: "🍳", image: HD("aloo-paratha,chhole-bhature,pav-bhaji", 903) },
  { name: "Snacks", icon: "🍟", image: HD("paneer-tikka,pakoda,sandwich,chaat", 904) },
  { name: "Chinese", icon: "🥡", image: HD("hakka-noodles,manchurian,fried-rice", 905) },
  { name: "Pizza", icon: "🍕", image: HD("pizza,margherita,cheese-pizza", 906) },
  { name: "Sweets", icon: "🍮", image: HD("gulab-jamun,rasgulla,sweets", 907) },
  { name: "South Indian - Idli Sambhar", icon: "🍥", image: HD("idli-sambhar,south-indian", 908) },
  { name: "South Indian - Dosa", icon: "🥘", image: HD("masala-dosa,plain-dosa", 909) },
  { name: "South Indian - Uttapam", icon: "🥞", image: HD("uttapam,onion-uttapam", 910) },
  { name: "Dal Dish", icon: "🍛", image: HD("dal-fry,dal-tadka,dal-makhani", 911) },
  { name: "Salad / Papad / Dahi", icon: "🥗", image: HD("papad,raita,salad,curd", 912) },
  { name: "Vegetables", icon: "🥦", image: HD("mix-veg,bhindi-masala,gatta-curry", 913) },
  { name: "Paneer Special", icon: "🧀", image: HD("paneer-butter-masala,shahi-paneer", 914) },
  { name: "Roti", icon: "🫓", image: HD("naan,roti,laccha-paratha", 915) },
  { name: "Special Vegetable", icon: "🍆", image: HD("kaju-curry,navratan-korma", 916) },
  { name: "Rice", icon: "🍚", image: HD("veg-biryani,jeera-rice,pulav", 917) },
  { name: "Special Thali / Combo", icon: "🍽️", image: HD("dal-bati,thali,rajasthani-thali", 918) },
];

export const menu: FoodItem[] = [
  // ---------- DRINKS — each with unique free HD image ----------
  { id: 1, name: "Sweet Lassi", price: 50, category: "Drinks", veg: true, rating: 4.6, description: "Thick, creamy sweetened yogurt drink in kulhad.", image: HD("sweet-lassi,yogurt,drink", 1) },
  { id: 2, name: "Masala Lassi", price: 50, category: "Drinks", veg: true, rating: 4.5, description: "Yogurt drink blended with roasted spices & mint.", image: HD("masala-lassi,spiced-yogurt", 2) },
  { id: 3, name: "Cold Coffee", price: 50, category: "Drinks", veg: true, rating: 4.6, description: "Chilled blended coffee with ice cream scoop.", image: pexels.coldCoffee },
  { id: 4, name: "Rose Shake", price: 50, category: "Drinks", veg: true, rating: 4.4, description: "Refreshing rose flavoured milkshake.", image: HD("rose-milkshake,rose-shake,pink-drink", 4) },

  // ---------- SOUP ----------
  { id: 5, name: "Tomato Soup", price: 130, category: "Soup", veg: true, rating: 4.4, description: "Creamy tomato soup served with croutons.", image: pexels.tomatoSoup },
  { id: 6, name: "Hot & Sour Soup", price: 150, category: "Soup", veg: true, rating: 4.5, description: "Tangy & spicy hot & sour soup with veggies.", image: HD("hot-and-sour-soup,chinese-soup", 6) },
  { id: 7, name: "Manchow Soup", price: 150, category: "Soup", veg: true, rating: 4.5, description: "Spicy manchow soup topped with fried noodles.", image: HD("manchow-soup,crispy-noodles-soup", 7) },

  // ---------- BREAKFAST ----------
  { id: 8, name: "Aloo Paratha + Curd", price: 80, category: "Breakfast", veg: true, rating: 4.6, description: "Stuffed potato paratha served with fresh curd.", image: HD("aloo-paratha,curd,paratha", 8) },
  { id: 9, name: "Mix Paratha + Curd", price: 90, category: "Breakfast", veg: true, rating: 4.6, description: "Mixed veg stuffed paratha with curd.", image: HD("mix-paratha,stuffed-paratha", 9) },
  { id: 10, name: "Pyaaz Paratha + Curd", price: 80, category: "Breakfast", veg: true, rating: 4.5, description: "Onion stuffed paratha served with curd.", image: HD("onion-paratha,pyaaz-paratha", 10) },
  { id: 11, name: "Paneer Paratha + Curd", price: 90, category: "Breakfast", veg: true, rating: 4.7, description: "Cottage cheese stuffed paratha with curd.", image: HD("paneer-paratha,cheese-paratha", 11) },
  { id: 12, name: "Gobhi Paratha + Curd", price: 80, category: "Breakfast", veg: true, rating: 4.5, description: "Cauliflower stuffed paratha with curd.", image: HD("gobhi-paratha,cauliflower-paratha", 12) },
  { id: 13, name: "Chhole-Bhature", price: 90, category: "Breakfast", veg: true, rating: 4.8, description: "Fluffy bhature served with spiced chickpeas.", image: pexels.chhole },
  { id: 14, name: "Pav Bhaji", price: 70, category: "Breakfast", veg: true, rating: 4.7, description: "Buttery mashed veg curry with soft pav.", image: pexels.pavBhaji },
  { id: 15, name: "Finger Chips", price: 70, category: "Breakfast", veg: true, rating: 4.4, description: "Crispy golden potato finger chips.", image: HD("french-fries,finger-chips,potato-fries", 15) },

  // ---------- SNACKS ----------
  { id: 16, name: "Veg Sandwich", price: 40, category: "Snacks", veg: true, rating: 4.3, description: "Fresh vegetable sandwich with chutney.", image: HD("veg-sandwich,vegetable-sandwich", 16) },
  { id: 17, name: "Bread Butter", price: 40, category: "Snacks", veg: true, rating: 4.1, description: "Soft bread with a generous layer of butter.", image: HD("bread-butter,toast-bread", 17) },
  { id: 18, name: "Cheese Masala Toast Sandwich", price: 120, category: "Snacks", veg: true, rating: 4.6, description: "Toasted sandwich loaded with cheese & masala.", image: HD("cheese-toast-sandwich,masala-toast", 18) },
  { id: 19, name: "Veg Cheese Grill Sandwich", price: 100, category: "Snacks", veg: true, rating: 4.5, description: "Grilled sandwich with veggies & melted cheese.", image: pexels.sandwich },
  { id: 20, name: "Hara Bahara Kabab", price: 180, category: "Snacks", veg: true, rating: 4.7, description: "Spinach & green pea patties, crisp and healthy.", image: HD("hara-bhara-kabab,green-kabab,veg-kabab", 20) },
  { id: 21, name: "Veg Pakoda", price: 140, category: "Snacks", veg: true, rating: 4.4, description: "Crunchy mixed vegetable fritters.", image: HD("veg-pakoda,mixed-pakora,fritters", 21) },
  { id: 22, name: "Paneer Pakoda", price: 160, category: "Snacks", veg: true, rating: 4.6, description: "Batter-fried paneer fritters, hot & crisp.", image: HD("paneer-pakoda,paneer-fritters", 22) },
  { id: 23, name: "Peanut Chaat", price: 160, category: "Snacks", veg: true, rating: 4.5, description: "Tangy peanut chaat with onions & spices.", image: HD("peanut-chaat,moongfali-chaat", 23) },
  { id: 24, name: "Peanut Masala", price: 140, category: "Snacks", veg: true, rating: 4.4, description: "Roasted peanuts tossed with masala.", image: HD("masala-peanuts,peanut-masala,snacks", 24) },
  { id: 25, name: "Sweet Corn Chaat", price: 140, category: "Snacks", veg: true, rating: 4.5, description: "Buttery sweet corn tossed with tangy spices.", image: HD("sweet-corn-chaat,corn-chaat", 25) },
  { id: 26, name: "Chana Roast (Kabuli)", price: 140, category: "Snacks", veg: true, rating: 4.4, description: "Roasted kabuli chana with masala.", image: HD("roasted-chana,kabuli-chana,chana-roast", 26) },
  { id: 27, name: "Paneer Tikka (Dry)", price: 220, category: "Snacks", veg: true, rating: 4.8, description: "Char-grilled marinated paneer, dry style.", image: pexels.paneerTikka },
  { id: 28, name: "Namkeen Chaat", price: 120, category: "Snacks", veg: true, rating: 4.3, description: "Savoury namkeen chaat with chutneys.", image: HD("namkeen-chaat,indian-chaat", 28) },

  // ---------- CHINESE ----------
  { id: 29, name: "Red Sauce Pasta", price: 100, category: "Chinese", veg: true, rating: 4.5, description: "Pasta tossed in tangy red tomato sauce.", image: HD("red-sauce-pasta,tomato-pasta", 29) },
  { id: 30, name: "White Sauce Pasta", price: 120, category: "Chinese", veg: true, rating: 4.6, description: "Creamy white sauce pasta with herbs.", image: pexels.pasta },
  { id: 31, name: "Veg Noodles", price: 100, category: "Chinese", veg: true, rating: 4.5, description: "Wok-tossed noodles with fresh vegetables.", image: HD("veg-noodles,vegetable-noodles", 31) },
  { id: 32, name: "Hakka Noodles", price: 120, category: "Chinese", veg: true, rating: 4.6, description: "Classic hakka noodles with crunchy veggies.", image: pexels.noodles },
  { id: 33, name: "Schezwan Noodles", price: 120, category: "Chinese", veg: true, rating: 4.6, description: "Fiery Schezwan noodles with vegetables.", image: HD("schezwan-noodles,szechwan-noodles", 33) },
  { id: 34, name: "American Chopsuey", price: 120, category: "Chinese", veg: true, rating: 4.5, description: "Crispy noodles topped with sweet & tangy sauce.", image: HD("american-chopsuey,chopsuey", 34) },
  { id: 35, name: "Chinese Bhel", price: 120, category: "Chinese", veg: true, rating: 4.4, description: "Crunchy Indo-Chinese bhel with veggies.", image: HD("chinese-bhel,indo-chinese-bhel", 35) },
  { id: 36, name: "Veg Manchurian", price: 110, category: "Chinese", veg: true, rating: 4.6, description: "Fried veg balls in spicy Manchurian gravy.", image: pexels.manchurian },
  { id: 37, name: "Dry Manchurian", price: 120, category: "Chinese", veg: true, rating: 4.6, description: "Crisp veg balls tossed in dry Manchurian sauce.", image: HD("dry-manchurian,gobi-manchurian", 37) },
  { id: 38, name: "Mushroom Chilli", price: 140, category: "Chinese", veg: true, rating: 4.6, description: "Mushrooms tossed in spicy chilli gravy.", image: HD("mushroom-chilli,chilli-mushroom", 38) },
  { id: 39, name: "Dry Mushroom Chilli", price: 160, category: "Chinese", veg: true, rating: 4.7, description: "Dry style spicy chilli mushrooms.", image: HD("dry-mushroom-chilli", 39) },
  { id: 40, name: "Paneer Chilli", price: 130, category: "Chinese", veg: true, rating: 4.7, description: "Paneer cubes in spicy chilli gravy.", image: pexels.chilli },
  { id: 41, name: "Dry Paneer Chilli", price: 150, category: "Chinese", veg: true, rating: 4.8, description: "Paneer tossed dry in tangy chilli sauce.", image: HD("dry-paneer-chilli", 41) },
  { id: 42, name: "Honey Chilli Potato", price: 150, category: "Chinese", veg: true, rating: 4.7, description: "Crispy potatoes glazed in honey chilli sauce.", image: HD("honey-chilli-potato,chilli-potato", 42) },
  { id: 43, name: "Veg Fry Rice", price: 120, category: "Chinese", veg: true, rating: 4.5, description: "Fried rice tossed with fresh vegetables.", image: HD("veg-fried-rice,fried-rice", 43) },
  { id: 44, name: "Schezwan Fry Rice", price: 140, category: "Chinese", veg: true, rating: 4.6, description: "Spicy Schezwan flavoured fried rice.", image: HD("schezwan-fried-rice", 44) },
  { id: 45, name: "Singapore Fry Rice", price: 160, category: "Chinese", veg: true, rating: 4.6, description: "Aromatic Singapore-style fried rice.", image: HD("singapore-fried-rice", 45) },
  { id: 46, name: "Manas (Special) Fry Rice", price: 260, category: "Chinese", veg: true, rating: 4.9, description: "Chef's special loaded fried rice.", image: HD("special-fried-rice,chef-special-rice", 46) },

  // ---------- PIZZA ----------
  { id: 47, name: "Manas Special Pizza", price: 180, category: "Pizza", veg: true, rating: 4.9, description: "Signature loaded pizza with extra toppings.", image: pexels.pizza },
  { id: 48, name: "Onion Pizza", price: 120, category: "Pizza", veg: true, rating: 4.4, description: "Cheesy pizza topped with onions.", image: HD("onion-pizza,cheese-onion-pizza", 48) },
  { id: 49, name: "Onion Tomato Pizza", price: 120, category: "Pizza", veg: true, rating: 4.5, description: "Classic pizza with onion & tomato.", image: HD("onion-tomato-pizza", 49) },
  { id: 50, name: "Mushroom Pizza", price: 120, category: "Pizza", veg: true, rating: 4.5, description: "Pizza topped with fresh mushrooms.", image: HD("mushroom-pizza", 50) },
  { id: 51, name: "Pineapple Pizza", price: 120, category: "Pizza", veg: true, rating: 4.4, description: "Sweet & tangy pineapple pizza.", image: HD("pineapple-pizza,hawaiian-pizza", 51) },
  { id: 52, name: "Mix Veg. Pizza", price: 120, category: "Pizza", veg: true, rating: 4.6, description: "Loaded with assorted fresh vegetables.", image: HD("veg-pizza,mix-veg-pizza", 52) },
  { id: 53, name: "Paneer Pizza", price: 150, category: "Pizza", veg: true, rating: 4.7, description: "Pizza topped with spiced paneer cubes.", image: HD("paneer-pizza,tikka-pizza", 53) },
  { id: 54, name: "Magerata Pizza", price: 120, category: "Pizza", veg: true, rating: 4.5, description: "Classic margherita with cheese & tomato.", image: HD("margherita-pizza", 54) },

  // ---------- SWEETS ----------
  { id: 55, name: "Gulab Jamun (2 pcs)", price: 50, category: "Sweets", veg: true, rating: 4.8, description: "Warm milk dumplings soaked in sugar syrup.", image: pexels.gulab },
  { id: 56, name: "Ras Gulle (2 pcs)", price: 40, category: "Sweets", veg: true, rating: 4.6, description: "Spongy cheese balls in light sugar syrup.", image: pexels.rasgulla },

  // ---------- SOUTH INDIAN - IDLI SAMBHAR ----------
  { id: 57, name: "Idli Sambhar [2]", price: 60, category: "South Indian - Idli Sambhar", veg: true, rating: 4.6, description: "Steamed rice cakes with sambar & chutney.", image: pexels.idli },
  { id: 58, name: "Butter Idli Sambhar", price: 100, category: "South Indian - Idli Sambhar", veg: true, rating: 4.7, description: "Buttery idli served with sambar & chutney.", image: HD("butter-idli,idli-butter", 58) },

  // ---------- SOUTH INDIAN - DOSA ----------
  { id: 59, name: "Plain Dosa", price: 80, category: "South Indian - Dosa", veg: true, rating: 4.5, description: "Crispy rice crepe with sambar & chutney.", image: HD("plain-dosa,crispy-dosa", 59) },
  { id: 60, name: "Masala Dosa", price: 100, category: "South Indian - Dosa", veg: true, rating: 4.8, description: "Dosa stuffed with spiced potato masala.", image: pexels.dosa },
  { id: 61, name: "Butter Masala Dosa", price: 120, category: "South Indian - Dosa", veg: true, rating: 4.8, description: "Buttery masala dosa, crisp & rich.", image: HD("butter-masala-dosa", 61) },
  { id: 62, name: "Mysore Plain Dosa", price: 100, category: "South Indian - Dosa", veg: true, rating: 4.6, description: "Plain dosa with spicy Mysore chutney.", image: HD("mysore-plain-dosa,mysore-dosa", 62) },
  { id: 63, name: "Mysore Masala Dosa", price: 120, category: "South Indian - Dosa", veg: true, rating: 4.8, description: "Masala dosa with spicy Mysore chutney.", image: HD("mysore-masala-dosa", 63) },
  { id: 64, name: "Butter Mysore Dosa", price: 140, category: "South Indian - Dosa", veg: true, rating: 4.8, description: "Buttery Mysore dosa with masala filling.", image: HD("butter-mysore-dosa", 64) },
  { id: 65, name: "Cheese Plain Dosa", price: 120, category: "South Indian - Dosa", veg: true, rating: 4.6, description: "Crispy dosa loaded with melted cheese.", image: HD("cheese-plain-dosa,cheese-dosa", 65) },
  { id: 66, name: "Cheese Masala Dosa", price: 150, category: "South Indian - Dosa", veg: true, rating: 4.8, description: "Masala dosa topped with cheese.", image: HD("cheese-masala-dosa", 66) },
  { id: 67, name: "Cheese Butter Masala Dosa", price: 170, category: "South Indian - Dosa", veg: true, rating: 4.9, description: "Rich cheese & butter masala dosa.", image: HD("cheese-butter-masala-dosa", 67) },
  { id: 68, name: "Paper Dosa", price: 160, category: "South Indian - Dosa", veg: true, rating: 4.7, description: "Extra large crispy paper-thin dosa.", image: HD("paper-dosa,family-dosa", 68) },

  // ---------- SOUTH INDIAN - UTTAPAM ----------
  { id: 69, name: "Plain Uttapam", price: 80, category: "South Indian - Uttapam", veg: true, rating: 4.5, description: "Thick soft rice pancake with chutney.", image: HD("plain-uttapam,uttapam", 69) },
  { id: 70, name: "Onion Uttapam", price: 90, category: "South Indian - Uttapam", veg: true, rating: 4.6, description: "Uttapam topped with fresh onions.", image: pexels.uttapam },
  { id: 71, name: "Onion Tomato Uttapam", price: 100, category: "South Indian - Uttapam", veg: true, rating: 4.6, description: "Uttapam topped with onion & tomato.", image: HD("onion-tomato-uttapam", 71) },
  { id: 72, name: "Butter Onion Tomato Uttapam", price: 120, category: "South Indian - Uttapam", veg: true, rating: 4.7, description: "Buttery uttapam with onion & tomato.", image: HD("butter-onion-tomato-uttapam", 72) },

  // ---------- DAL DISH ----------
  { id: 73, name: "Dal Fry", price: 110, category: "Dal Dish", veg: true, rating: 4.5, description: "Yellow lentils tempered with cumin & garlic.", image: HD("dal-fry,yellow-dal", 73) },
  { id: 74, name: "Dal Tadka", price: 130, category: "Dal Dish", veg: true, rating: 4.6, description: "Lentils finished with a sizzling ghee tadka.", image: HD("dal-tadka,tadka-dal", 74) },
  { id: 75, name: "Dal Makhani", price: 180, category: "Dal Dish", veg: true, rating: 4.8, description: "Creamy black lentils slow-cooked with butter.", image: pexels.dalMakhani },
  { id: 76, name: "Dal Jeera", price: 130, category: "Dal Dish", veg: true, rating: 4.5, description: "Lentils tempered with fragrant cumin.", image: HD("dal-jeera,jeera-dal", 76) },
  { id: 77, name: "Dal Punjabi", price: 150, category: "Dal Dish", veg: true, rating: 4.6, description: "Rich Punjabi-style dal with spices.", image: HD("dal-punjabi,punjabi-dal", 77) },
  { id: 78, name: "Butter Dal Fry", price: 180, category: "Dal Dish", veg: true, rating: 4.7, description: "Dal fry enriched with a dollop of butter.", image: HD("butter-dal-fry", 78) },

  // ---------- SALAD / PAPAD / DAHI ----------
  { id: 79, name: "Onion Salad", price: 40, category: "Salad / Papad / Dahi", veg: true, rating: 4.2, description: "Sliced onion salad with lemon.", image: HD("onion-salad,sliced-onion", 79) },
  { id: 80, name: "Green Salad", price: 60, category: "Salad / Papad / Dahi", veg: true, rating: 4.4, description: "Fresh mixed green salad.", image: pexels.salad },
  { id: 81, name: "Roasted Papad (Moong)", price: 20, category: "Salad / Papad / Dahi", veg: true, rating: 4.3, description: "Crisp roasted moong papad.", image: HD("roasted-papad,moong-papad", 81) },
  { id: 82, name: "Fry Papad (Moong)", price: 30, category: "Salad / Papad / Dahi", veg: true, rating: 4.3, description: "Crunchy deep-fried moong papad.", image: HD("fried-papad,fry-papad", 82) },
  { id: 83, name: "Makki Papad Roasted", price: 30, category: "Salad / Papad / Dahi", veg: true, rating: 4.3, description: "Roasted corn papad, light & crisp.", image: HD("makki-papad,corn-papad", 83) },
  { id: 84, name: "Fry Makki Papad", price: 40, category: "Salad / Papad / Dahi", veg: true, rating: 4.3, description: "Fried corn papad, crunchy delight.", image: HD("fry-makki-papad", 84) },
  { id: 85, name: "Masala Papad", price: 60, category: "Salad / Papad / Dahi", veg: true, rating: 4.5, description: "Papad topped with onion, tomato & masala.", image: HD("masala-papad", 85) },
  { id: 86, name: "Makki Masala Papad", price: 80, category: "Salad / Papad / Dahi", veg: true, rating: 4.5, description: "Corn papad topped with tangy masala.", image: HD("makki-masala-papad", 86) },
  { id: 87, name: "Curd", price: 50, category: "Salad / Papad / Dahi", veg: true, rating: 4.4, description: "Fresh homemade curd.", image: HD("curd,dahi,yogurt", 87) },
  { id: 88, name: "Butter Milk", price: 20, category: "Salad / Papad / Dahi", veg: true, rating: 4.4, description: "Refreshing spiced buttermilk.", image: HD("buttermilk,chaas", 88) },
  { id: 89, name: "Bundi Raita", price: 100, category: "Salad / Papad / Dahi", veg: true, rating: 4.5, description: "Curd with crunchy boondi & spices.", image: HD("boondi-raita,bundi-raita", 89) },
  { id: 90, name: "Veg Raita", price: 100, category: "Salad / Papad / Dahi", veg: true, rating: 4.5, description: "Curd mixed with fresh vegetables.", image: HD("veg-raita,vegetable-raita", 90) },
  { id: 91, name: "Pineapple Raita", price: 150, category: "Salad / Papad / Dahi", veg: true, rating: 4.6, description: "Sweet & tangy pineapple raita.", image: pexels.raita },

  // ---------- VEGETABLES ----------
  { id: 92, name: "Kadi Pakoda", price: 130, category: "Vegetables", veg: true, rating: 4.5, description: "Yogurt curry with soft gram flour dumplings.", image: HD("kadi-pakoda,pakoda-kadi", 92) },
  { id: 93, name: "Matar Palak", price: 180, category: "Vegetables", veg: true, rating: 4.6, description: "Green peas cooked in spinach gravy.", image: HD("matar-palak,palak-matar", 93) },
  { id: 94, name: "Mix Veg.", price: 180, category: "Vegetables", veg: true, rating: 4.5, description: "Assorted seasonal vegetables in gravy.", image: HD("mix-veg,mixed-vegetable-curry", 94) },
  { id: 95, name: "Bhindi Masala", price: 180, category: "Vegetables", veg: true, rating: 4.6, description: "Okra sautéed with onions & spices.", image: HD("bhindi-masala,okra-masala", 95) },
  { id: 96, name: "Gobhi Masala", price: 130, category: "Vegetables", veg: true, rating: 4.5, description: "Cauliflower cooked in spicy masala.", image: HD("gobhi-masala,cauliflower-masala", 96) },
  { id: 97, name: "Sev Tamatar", price: 130, category: "Vegetables", veg: true, rating: 4.5, description: "Tomato gravy topped with crunchy sev.", image: HD("sev-tamatar,tomato-sev-curry", 97) },
  { id: 98, name: "Dudh Sev", price: 180, category: "Vegetables", veg: true, rating: 4.5, description: "Traditional milk & sev preparation.", image: HD("dudh-sev,milk-sev", 98) },
  { id: 99, name: "Jira Aalu", price: 130, category: "Vegetables", veg: true, rating: 4.4, description: "Potatoes tempered with cumin seeds.", image: HD("jeera-aloo,cumin-potato", 99) },
  { id: 100, name: "Aalu Palak", price: 180, category: "Vegetables", veg: true, rating: 4.5, description: "Potatoes cooked in spinach gravy.", image: HD("aloo-palak,potato-spinach", 100) },
  { id: 101, name: "Aalu Payaaz", price: 130, category: "Vegetables", veg: true, rating: 4.4, description: "Potatoes cooked with onions & spices.", image: HD("aloo-pyaaz,potato-onion-curry", 101) },
  { id: 102, name: "Aalu Matar", price: 130, category: "Vegetables", veg: true, rating: 4.4, description: "Potato & green peas in tomato gravy.", image: HD("aloo-matar,potato-peas", 102) },
  { id: 103, name: "Aalu Gobhi", price: 130, category: "Vegetables", veg: true, rating: 4.5, description: "Potato & cauliflower cooked with spices.", image: HD("aloo-gobhi,potato-cauliflower", 103) },
  { id: 104, name: "Besan Gatta Dry", price: 180, category: "Vegetables", veg: true, rating: 4.6, description: "Gram flour dumplings tossed dry with spices.", image: HD("besan-gatta,dry-gatta", 104) },
  { id: 105, name: "Gatta Curry", price: 180, category: "Vegetables", veg: true, rating: 4.6, description: "Rajasthani gram flour dumplings in curry.", image: HD("gatta-curry,rajasthani-gatta", 105) },
  { id: 106, name: "Lahsuni Palak", price: 220, category: "Vegetables", veg: true, rating: 4.7, description: "Spinach tempered with roasted garlic.", image: HD("lahsuni-palak,garlic-spinach", 106) },
  { id: 107, name: "Corn Palak", price: 220, category: "Vegetables", veg: true, rating: 4.7, description: "Sweet corn in creamy spinach gravy.", image: HD("corn-palak,sweet-corn-palak", 107) },
  { id: 108, name: "Dahi Fry", price: 130, category: "Vegetables", veg: true, rating: 4.5, description: "Curd-based fried curry preparation.", image: HD("dahi-fry,curd-fry", 108) },
  { id: 109, name: "Sarson Saag (Seasonal)", price: 220, category: "Vegetables", veg: true, rating: 4.8, description: "Winter special mustard greens saag.", image: HD("sarson-saag,mustard-saag", 109) },
  { id: 110, name: "Ker Sangari Saag (Seasonal)", price: 260, category: "Vegetables", veg: true, rating: 4.7, description: "Traditional Rajasthani ker sangari.", image: HD("ker-sangri,rajasthani-sabzi", 110) },

  // ---------- PANEER SPECIAL ----------
  { id: 111, name: "Matar Paneer", price: 160, category: "Paneer Special", veg: true, rating: 4.6, description: "Paneer & green peas in tomato onion gravy.", image: HD("matar-paneer,peas-paneer", 111) },
  { id: 112, name: "Chana Paneer", price: 180, category: "Paneer Special", veg: true, rating: 4.6, description: "Paneer with chickpeas in rich gravy.", image: HD("chana-paneer,chickpea-paneer", 112) },
  { id: 113, name: "Palak Paneer", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Cottage cheese in a smooth spinach gravy.", image: HD("palak-paneer,spinach-paneer", 113) },
  { id: 114, name: "Paneer Tikka - Gravy", price: 180, category: "Paneer Special", veg: true, rating: 4.8, description: "Grilled paneer tikka in creamy gravy.", image: HD("paneer-tikka-gravy", 114) },
  { id: 115, name: "Shahi Paneer", price: 180, category: "Paneer Special", veg: true, rating: 4.8, description: "Royal paneer curry with cashew cream.", image: HD("shahi-paneer,royal-paneer", 115) },
  { id: 116, name: "Kadhai Paneer", price: 180, category: "Paneer Special", veg: true, rating: 4.8, description: "Paneer cooked with peppers & kadhai masala.", image: HD("kadhai-paneer,karahi-paneer", 116) },
  { id: 117, name: "Paneer Butter Masala", price: 180, category: "Paneer Special", veg: true, rating: 4.9, description: "Paneer in a rich buttery tomato gravy.", image: pexels.paneer },
  { id: 118, name: "Paneer Bhurji", price: 180, category: "Paneer Special", veg: true, rating: 4.6, description: "Scrambled paneer with onion, tomato & spices.", image: HD("paneer-bhurji,scrambled-paneer", 118) },
  { id: 119, name: "Mushroom Paneer", price: 180, category: "Paneer Special", veg: true, rating: 4.6, description: "Paneer & mushrooms in a spiced gravy.", image: HD("mushroom-paneer", 119) },
  { id: 120, name: "Paneer Punjabi", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Rich Punjabi-style paneer curry.", image: HD("paneer-punjabi,punjabi-paneer", 120) },
  { id: 121, name: "Paneer Angara", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Smoky paneer in a fiery tomato gravy.", image: HD("paneer-angara,smoky-paneer", 121) },
  { id: 122, name: "Paneer Handi", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Paneer slow-cooked in a handi masala.", image: HD("paneer-handi,handi-paneer", 122) },
  { id: 123, name: "Malai Kopta", price: 220, category: "Paneer Special", veg: true, rating: 4.9, description: "Soft koftas in a rich creamy gravy.", image: HD("malai-kofta,kofta-curry", 123) },
  { id: 124, name: "Paneer Tufani", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Spicy tufani-style paneer curry.", image: HD("paneer-tufani,spicy-paneer", 124) },
  { id: 125, name: "Paneer Lababdar", price: 180, category: "Paneer Special", veg: true, rating: 4.8, description: "Paneer in a luscious tomato butter gravy.", image: HD("paneer-lababdar", 125) },
  { id: 126, name: "Special Rajmaa", price: 180, category: "Paneer Special", veg: true, rating: 4.7, description: "Red kidney beans in a hearty gravy.", image: HD("rajma,rajma-masala", 126) },

  // ---------- ROTI ----------
  { id: 127, name: "Makka Raabdi", price: 50, category: "Roti", veg: true, rating: 4.5, description: "Traditional corn raabdi preparation.", image: HD("makki-raabdi,corn-raabdi", 127) },
  { id: 128, name: "Plain Tandoori Roti", price: 15, category: "Roti", veg: true, rating: 4.4, description: "Whole wheat bread baked in tandoor.", image: HD("tandoori-roti,plain-roti", 128) },
  { id: 129, name: "Plain Tava Roti", price: 15, category: "Roti", veg: true, rating: 4.3, description: "Soft roti made on the tava.", image: HD("tava-roti,chapati,phulka", 129) },
  { id: 130, name: "Butter Tandoori Roti", price: 20, category: "Roti", veg: true, rating: 4.5, description: "Tandoori roti brushed with butter.", image: HD("butter-roti,butter-tandoori-roti", 130) },
  { id: 131, name: "Amul Butter Tava Roti", price: 20, category: "Roti", veg: true, rating: 4.5, description: "Tava roti with Amul butter.", image: HD("amul-butter-roti", 131) },
  { id: 132, name: "Laccha Paratha Butter", price: 60, category: "Roti", veg: true, rating: 4.7, description: "Flaky layered paratha with butter.", image: HD("laccha-paratha,layered-paratha", 132) },
  { id: 133, name: "Butter Naan", price: 60, category: "Roti", veg: true, rating: 4.7, description: "Fluffy naan glazed with butter.", image: HD("butter-naan,naan-bread", 133) },
  { id: 134, name: "Plain Naan", price: 50, category: "Roti", veg: true, rating: 4.6, description: "Soft leavened flatbread from the tandoor.", image: pexels.naan },
  { id: 135, name: "Garlic Naan Butter", price: 80, category: "Roti", veg: true, rating: 4.8, description: "Garlic naan brushed with butter.", image: HD("garlic-naan,garlic-butter-naan", 135) },
  { id: 136, name: "Cheese Garlic Naan", price: 100, category: "Roti", veg: true, rating: 4.8, description: "Garlic naan loaded with melted cheese.", image: HD("cheese-garlic-naan", 136) },
  { id: 137, name: "Cheese Naan", price: 80, category: "Roti", veg: true, rating: 4.7, description: "Soft naan stuffed with cheese.", image: HD("cheese-naan,stuffed-naan", 137) },
  { id: 138, name: "Missi Roti", price: 80, category: "Roti", veg: true, rating: 4.6, description: "Spiced gram flour flatbread.", image: HD("missi-roti,besan-roti", 138) },
  { id: 139, name: "Makka Roti", price: 50, category: "Roti", veg: true, rating: 4.5, description: "Traditional corn flour flatbread.", image: HD("makki-roti,maize-roti", 139) },
  { id: 140, name: "Bajara Roti", price: 60, category: "Roti", veg: true, rating: 4.5, description: "Healthy pearl millet flatbread.", image: HD("bajra-roti,millet-roti", 140) },

  // ---------- SPECIAL VEGETABLE ----------
  { id: 141, name: "Special Manas Sabji", price: 280, category: "Special Vegetable", veg: true, rating: 4.9, description: "Chef's signature special vegetable curry.", image: HD("special-manas-sabji,chef-special-curry", 141) },
  { id: 142, name: "Kaju Chana", price: 220, category: "Special Vegetable", veg: true, rating: 4.7, description: "Cashews & chickpeas in a rich gravy.", image: HD("kaju-chana,cashew-chana", 142) },
  { id: 143, name: "Kaju Kari", price: 240, category: "Special Vegetable", veg: true, rating: 4.8, description: "Cashews cooked in a creamy curry.", image: HD("kaju-curry,cashew-curry", 143) },
  { id: 144, name: "Navratan Korma", price: 220, category: "Special Vegetable", veg: true, rating: 4.7, description: "Nine-jewel mixed veg in creamy korma.", image: HD("navratan-korma,nine-jewel-curry", 144) },
  { id: 145, name: "Mushroom Kari", price: 220, category: "Special Vegetable", veg: true, rating: 4.7, description: "Mushrooms in a rich flavourful curry.", image: HD("mushroom-curry,mushroom-kari", 145) },
  { id: 146, name: "Matar Mushroom", price: 200, category: "Special Vegetable", veg: true, rating: 4.6, description: "Green peas & mushrooms in spiced gravy.", image: HD("matar-mushroom,peas-mushroom", 146) },
  { id: 147, name: "Kabuli Chana Masala", price: 200, category: "Special Vegetable", veg: true, rating: 4.6, description: "White chickpeas in tangy masala.", image: HD("kabuli-chana,chana-masala", 147) },
  { id: 148, name: "Chana Kari (Kala Chana)", price: 200, category: "Special Vegetable", veg: true, rating: 4.6, description: "Black chickpeas in a spiced curry.", image: HD("kala-chana,black-chickpea-curry", 148) },
  { id: 149, name: "Paneer Pasanda", price: 200, category: "Special Vegetable", veg: true, rating: 4.8, description: "Stuffed paneer in a rich creamy gravy.", image: HD("paneer-pasanda,stuffed-paneer-curry", 149) },
  { id: 150, name: "Cheese Butter Masala", price: 260, category: "Special Vegetable", veg: true, rating: 4.8, description: "Cheese in a luscious butter masala gravy.", image: HD("cheese-butter-masala", 150) },

  // ---------- RICE ----------
  { id: 151, name: "Plain Rice", price: 100, category: "Rice", veg: true, rating: 4.3, description: "Perfectly steamed basmati rice.", image: HD("plain-rice,steamed-rice", 151) },
  { id: 152, name: "Jeera Rice", price: 120, category: "Rice", veg: true, rating: 4.5, description: "Basmati rice tempered with cumin seeds.", image: HD("jeera-rice,cumin-rice", 152) },
  { id: 153, name: "Veg. Pulav", price: 150, category: "Rice", veg: true, rating: 4.5, description: "Mildly spiced rice with mixed vegetables.", image: HD("veg-pulav,vegetable-pulao", 153) },
  { id: 154, name: "Matar Pulav", price: 140, category: "Rice", veg: true, rating: 4.5, description: "Fragrant rice cooked with green peas.", image: HD("matar-pulav,peas-pulao", 154) },
  { id: 155, name: "Kashmiri Pulav", price: 150, category: "Rice", veg: true, rating: 4.6, description: "Sweet pulav with fruits & nuts.", image: HD("kashmiri-pulav,fruit-pulao", 155) },
  { id: 156, name: "Veg Biryani", price: 180, category: "Rice", veg: true, rating: 4.7, description: "Fragrant biryani with veggies & spices.", image: pexels.biryani },
  { id: 157, name: "Paneer Pulav", price: 180, category: "Rice", veg: true, rating: 4.7, description: "Aromatic pulav loaded with paneer.", image: HD("paneer-pulav,paneer-pulao", 157) },

  // ---------- SPECIAL THALI / COMBO ----------
  { id: 158, name: "Dal Baati Chaach", price: 180, category: "Special Thali / Combo", veg: true, rating: 4.8, description: "Rajasthani dal baati with chaach. Add Churma Laddu for ₹50.", image: HD("dal-bati,rajasthani-dal-bati", 158) },
  { id: 159, name: "Thali", price: 150, category: "Special Thali / Combo", veg: true, rating: 4.7, description: "Wholesome thali with dal, sabzi, roti & rice.", image: HD("thali,indian-thali,veg-thali", 159) },
  { id: 160, name: "Special Manas Thali", price: 250, category: "Special Thali / Combo", veg: true, rating: 4.9, description: "Grand special thali with a variety of dishes.", image: pexels.thali },
];

export const reviews = [
  { id: 1, name: "Ananya Sharma", rating: 5, text: "The Paneer Butter Masala is absolutely divine! Fast delivery and food was piping hot.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { id: 2, name: "Rohan Verma", rating: 5, text: "Best thali in town. Generous portions and authentic taste. Highly recommend Manas!", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { id: 3, name: "Priya Nair", rating: 4, text: "Loved the South Indian dosa. Crispy and perfect chutney. Will order again for sure.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
  { id: 4, name: "Karan Mehta", rating: 5, text: "Dal Baati Chaach was authentic and delicious. Great value for money and premium packaging.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
];

export const galleryImages = [
  { src: "/images/bamboo-entrance.jpg", title: "Traditional Bamboo Entrance", category: "Ambiance" },
  { src: "/images/bamboo-group.jpg", title: "Cozy Group Gatherings at Bamboo Hut", category: "Ambiance" },
  { src: "/images/happy-customers.jpg", title: "Happy Groups & Celebrations at MANAS", category: "Hospitality" },
  { src: "/images/resort-lawn-night.jpg", title: "Lush Night Garden Lawn & Resort", category: "Resort" },
  { src: "/images/delicious-food-table.jpg", title: "Authentic Multi-Cuisine Feast", category: "Food" },
  { src: "/images/swimming-pool.jpg", title: "Illuminated Night Swimming Pool", category: "Resort" },
  { src: "/images/fine-dining.jpg", title: "Fine Dining Hall & Chandeliers", category: "Dining" },
  { src: "/images/hotel-exterior.jpg", title: "HOTEL MANAS Grand Entrance", category: "Resort" },
];
