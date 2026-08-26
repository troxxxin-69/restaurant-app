-- Seed file for Supabase 'menu_items' table
-- Strictly matching table columns: id, name, price, description, category, image_url, available

INSERT INTO menu_items (id, name, price, description, category, image_url, available)
VALUES
  (1, 'Sweet Lassi', 50, 'Thick, creamy sweetened yogurt drink in kulhad.', 'Drinks', 'https://images.pexels.com/photos/29699511/pexels-photo-29699511.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (2, 'Masala Lassi', 50, 'Yogurt drink blended with roasted spices & mint.', 'Drinks', 'https://images.pexels.com/photos/29699511/pexels-photo-29699511.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (3, 'Cold Coffee', 50, 'Chilled blended coffee with ice cream scoop.', 'Drinks', 'https://images.pexels.com/photos/33094574/pexels-photo-33094574.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (4, 'Rose Shake', 50, 'Refreshing rose flavoured milkshake.', 'Drinks', 'https://images.pexels.com/photos/5041474/pexels-photo-5041474.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (5, 'Tomato Soup', 130, 'Creamy tomato soup served with croutons.', 'Soup', 'https://images.pexels.com/photos/17696681/pexels-photo-17696681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (6, 'Hot & Sour Soup', 150, 'Tangy & spicy hot & sour soup with veggies.', 'Soup', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (7, 'Manchow Soup', 150, 'Spicy manchow soup topped with fried noodles.', 'Soup', 'https://images.unsplash.com/photo-1603105037880-880cd4edfb5d?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (8, 'Aloo Paratha + Curd', 80, 'Stuffed potato paratha served with fresh curd.', 'Breakfast', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (9, 'Mix Paratha + Curd', 90, 'Mixed veg stuffed paratha with curd.', 'Breakfast', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (10, 'Pyaaz Paratha + Curd', 80, 'Onion stuffed paratha served with curd.', 'Breakfast', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (11, 'Paneer Paratha + Curd', 90, 'Cottage cheese stuffed paratha with curd.', 'Breakfast', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (12, 'Gobhi Paratha + Curd', 80, 'Cauliflower stuffed paratha with curd.', 'Breakfast', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (13, 'Chhole-Bhature', 90, 'Fluffy bhature served with spiced chickpeas.', 'Breakfast', 'https://images.unsplash.com/photo-1626132647524-4a77be5178cf?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (14, 'Pav Bhaji', 70, 'Buttery mashed veg curry with soft pav.', 'Breakfast', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (15, 'Finger Chips', 70, 'Crispy golden potato finger chips.', 'Breakfast', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (16, 'Veg Sandwich', 40, 'Fresh vegetable sandwich with chutney.', 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (17, 'Bread Butter', 40, 'Soft bread with a generous layer of butter.', 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (18, 'Cheese Masala Toast Sandwich', 120, 'Toasted sandwich loaded with cheese & masala.', 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (19, 'Veg Cheese Grill Sandwich', 100, 'Grilled sandwich with veggies & melted cheese.', 'Snacks', 'https://images.pexels.com/photos/29747752/pexels-photo-29747752.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (20, 'Hara Bahara Kabab', 180, 'Spinach & green pea patties, crisp and healthy.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (21, 'Veg Pakoda', 140, 'Crunchy mixed vegetable fritters.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (22, 'Paneer Pakoda', 160, 'Batter-fried paneer fritters, hot & crisp.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (23, 'Peanut Chaat', 160, 'Tangy peanut chaat with onions & spices.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (24, 'Peanut Masala', 140, 'Roasted peanuts tossed with masala.', 'Snacks', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (25, 'Sweet Corn Chaat', 140, 'Buttery sweet corn tossed with tangy spices.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (26, 'Chana Roast (Kabuli)', 140, 'Roasted kabuli chana with masala.', 'Snacks', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (27, 'Paneer Tikka (Dry)', 220, 'Char-grilled marinated paneer, dry style.', 'Snacks', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (28, 'Namkeen Chaat', 120, 'Savoury namkeen chaat with chutneys.', 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (29, 'Red Sauce Pasta', 100, 'Pasta tossed in tangy red tomato sauce.', 'Chinese', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (30, 'White Sauce Pasta', 120, 'Creamy white sauce pasta with herbs.', 'Chinese', 'https://images.pexels.com/photos/29039084/pexels-photo-29039084.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (31, 'Veg Noodles', 100, 'Wok-tossed noodles with fresh vegetables.', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (32, 'Hakka Noodles', 120, 'Classic hakka noodles with crunchy veggies.', 'Chinese', 'https://images.pexels.com/photos/18698263/pexels-photo-18698263.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (33, 'Schezwan Noodles', 120, 'Fiery Schezwan noodles with vegetables.', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (34, 'American Chopsuey', 120, 'Crispy noodles topped with sweet & tangy sauce.', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (35, 'Chinese Bhel', 120, 'Crunchy Indo-Chinese bhel with veggies.', 'Chinese', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (36, 'Veg Manchurian', 110, 'Fried veg balls in spicy Manchurian gravy.', 'Chinese', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (37, 'Dry Manchurian', 120, 'Crisp veg balls tossed in dry Manchurian sauce.', 'Chinese', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (38, 'Mushroom Chilli', 140, 'Mushrooms tossed in spicy chilli gravy.', 'Chinese', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (39, 'Dry Mushroom Chilli', 160, 'Dry style spicy chilli mushrooms.', 'Chinese', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (40, 'Paneer Chilli', 130, 'Paneer cubes in spicy chilli gravy.', 'Chinese', 'https://images.pexels.com/photos/29631468/pexels-photo-29631468.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (41, 'Dry Paneer Chilli', 150, 'Paneer tossed dry in tangy chilli sauce.', 'Chinese', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (42, 'Honey Chilli Potato', 150, 'Crispy potatoes glazed in honey chilli sauce.', 'Chinese', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (43, 'Veg Fry Rice', 120, 'Fried rice tossed with fresh vegetables.', 'Chinese', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (44, 'Schezwan Fry Rice', 140, 'Spicy Schezwan flavoured fried rice.', 'Chinese', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (45, 'Singapore Fry Rice', 160, 'Aromatic Singapore-style fried rice.', 'Chinese', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (46, 'Manas (Special) Fry Rice', 260, 'Chef''s special loaded fried rice.', 'Chinese', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (47, 'Manas Special Pizza', 180, 'Signature loaded pizza with extra toppings.', 'Pizza', 'https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (48, 'Onion Pizza', 120, 'Cheesy pizza topped with onions.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (49, 'Onion Tomato Pizza', 120, 'Classic pizza with onion & tomato.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (50, 'Mushroom Pizza', 120, 'Pizza topped with fresh mushrooms.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (51, 'Pineapple Pizza', 120, 'Sweet & tangy pineapple pizza.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (52, 'Mix Veg. Pizza', 120, 'Loaded with assorted fresh vegetables.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (53, 'Paneer Pizza', 150, 'Pizza topped with spiced paneer cubes.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (54, 'Magerata Pizza', 120, 'Classic margherita with cheese & tomato.', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (55, 'Gulab Jamun (2 pcs)', 50, 'Warm milk dumplings soaked in sugar syrup.', 'Sweets', 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (56, 'Ras Gulle (2 pcs)', 40, 'Spongy cheese balls in light sugar syrup.', 'Sweets', 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (57, 'Idli Sambhar [2]', 60, 'Steamed rice cakes with sambar & chutney.', 'South Indian - Idli Sambhar', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (58, 'Butter Idli Sambhar', 100, 'Buttery idli served with sambar & chutney.', 'South Indian - Idli Sambhar', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (59, 'Plain Dosa', 80, 'Crispy rice crepe with sambar & chutney.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (60, 'Masala Dosa', 100, 'Dosa stuffed with spiced potato masala.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (61, 'Butter Masala Dosa', 120, 'Buttery masala dosa, crisp & rich.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (62, 'Mysore Plain Dosa', 100, 'Plain dosa with spicy Mysore chutney.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (63, 'Mysore Masala Dosa', 120, 'Masala dosa with spicy Mysore chutney.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (64, 'Butter Mysore Dosa', 140, 'Buttery Mysore dosa with masala filling.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (65, 'Cheese Plain Dosa', 120, 'Crispy dosa loaded with melted cheese.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (66, 'Cheese Masala Dosa', 150, 'Masala dosa topped with cheese.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (67, 'Cheese Butter Masala Dosa', 170, 'Rich cheese & butter masala dosa.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (68, 'Paper Dosa', 160, 'Extra large crispy paper-thin dosa.', 'South Indian - Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (69, 'Plain Uttapam', 80, 'Thick soft rice pancake with chutney.', 'South Indian - Uttapam', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (70, 'Onion Uttapam', 90, 'Uttapam topped with fresh onions.', 'South Indian - Uttapam', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (71, 'Onion Tomato Uttapam', 100, 'Uttapam topped with onion & tomato.', 'South Indian - Uttapam', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (72, 'Butter Onion Tomato Uttapam', 120, 'Buttery uttapam with onion & tomato.', 'South Indian - Uttapam', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (73, 'Dal Fry', 110, 'Yellow lentils tempered with cumin & garlic.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (74, 'Dal Tadka', 130, 'Lentils finished with a sizzling ghee tadka.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (75, 'Dal Makhani', 180, 'Creamy black lentils slow-cooked with butter.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (76, 'Dal Jeera', 130, 'Lentils tempered with fragrant cumin.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (77, 'Dal Punjabi', 150, 'Rich Punjabi-style dal with spices.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (78, 'Butter Dal Fry', 180, 'Dal fry enriched with a dollop of butter.', 'Dal Dish', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (79, 'Onion Salad', 40, 'Sliced onion salad with lemon.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (80, 'Green Salad', 60, 'Fresh mixed green salad.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (81, 'Roasted Papad (Moong)', 20, 'Crisp roasted moong papad.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (82, 'Fry Papad (Moong)', 30, 'Crunchy deep-fried moong papad.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (83, 'Makki Papad Roasted', 30, 'Roasted corn papad, light & crisp.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (84, 'Fry Makki Papad', 40, 'Fried corn papad, crunchy delight.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (85, 'Masala Papad', 60, 'Papad topped with onion, tomato & masala.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (86, 'Makki Masala Papad', 80, 'Corn papad topped with tangy masala.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (87, 'Curd', 50, 'Fresh homemade curd.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (88, 'Butter Milk', 20, 'Refreshing spiced buttermilk.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (89, 'Bundi Raita', 100, 'Curd with crunchy boondi & spices.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (90, 'Veg Raita', 100, 'Curd mixed with fresh vegetables.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (91, 'Pineapple Raita', 150, 'Sweet & tangy pineapple raita.', 'Salad / Papad / Dahi', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (92, 'Kadi Pakoda', 130, 'Yogurt curry with soft gram flour dumplings.', 'Vegetables', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (93, 'Matar Palak', 180, 'Green peas cooked in spinach gravy.', 'Vegetables', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (94, 'Mix Veg.', 180, 'Assorted seasonal vegetables in gravy.', 'Vegetables', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (95, 'Bhindi Masala', 180, 'Okra sautéed with onions & spices.', 'Vegetables', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (96, 'Gobhi Masala', 130, 'Cauliflower cooked in spicy masala.', 'Vegetables', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (97, 'Sev Tamatar', 130, 'Tomato gravy topped with crunchy sev.', 'Vegetables', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (98, 'Dudh Sev', 180, 'Traditional milk & sev preparation.', 'Vegetables', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (99, 'Jira Aalu', 130, 'Potatoes tempered with cumin seeds.', 'Vegetables', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (100, 'Aalu Palak', 180, 'Potatoes cooked in spinach gravy.', 'Vegetables', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (101, 'Aalu Payaaz', 130, 'Potatoes cooked with onions & spices.', 'Vegetables', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (102, 'Aalu Matar', 130, 'Potato & green peas in tomato gravy.', 'Vegetables', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (103, 'Aalu Gobhi', 130, 'Potato & cauliflower cooked with spices.', 'Vegetables', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (104, 'Besan Gatta Dry', 180, 'Gram flour dumplings tossed dry with spices.', 'Vegetables', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (105, 'Gatta Curry', 180, 'Rajasthani gram flour dumplings in curry.', 'Vegetables', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (106, 'Lahsuni Palak', 220, 'Spinach tempered with roasted garlic.', 'Vegetables', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (107, 'Corn Palak', 220, 'Sweet corn in creamy spinach gravy.', 'Vegetables', 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (108, 'Dahi Fry', 130, 'Curd-based fried curry preparation.', 'Vegetables', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (109, 'Sarson Saag (Seasonal)', 220, 'Winter special mustard greens saag.', 'Vegetables', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (110, 'Ker Sangari Saag (Seasonal)', 260, 'Traditional Rajasthani ker sangari.', 'Vegetables', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (111, 'Matar Paneer', 160, 'Paneer & green peas in tomato onion gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (112, 'Chana Paneer', 180, 'Paneer with chickpeas in rich gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (113, 'Palak Paneer', 180, 'Cottage cheese in a smooth spinach gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (114, 'Paneer Tikka - Gravy', 180, 'Grilled paneer tikka in creamy gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (115, 'Shahi Paneer', 180, 'Royal paneer curry with cashew cream.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (116, 'Kadhai Paneer', 180, 'Paneer cooked with peppers & kadhai masala.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (117, 'Paneer Butter Masala', 180, 'Paneer in a rich buttery tomato gravy.', 'Paneer Special', 'https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', TRUE),
  (118, 'Paneer Bhurji', 180, 'Scrambled paneer with onion, tomato & spices.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (119, 'Mushroom Paneer', 180, 'Paneer & mushrooms in a spiced gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (120, 'Paneer Punjabi', 180, 'Rich Punjabi-style paneer curry.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (121, 'Paneer Angara', 180, 'Smoky paneer in a fiery tomato gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (122, 'Paneer Handi', 180, 'Paneer slow-cooked in a handi masala.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (123, 'Malai Kopta', 220, 'Soft koftas in a rich creamy gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (124, 'Paneer Tufani', 180, 'Spicy tufani-style paneer curry.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (125, 'Paneer Lababdar', 180, 'Paneer in a luscious tomato butter gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (126, 'Special Rajmaa', 180, 'Red kidney beans in a hearty gravy.', 'Paneer Special', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (127, 'Makka Raabdi', 50, 'Traditional corn raabdi preparation.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (128, 'Plain Tandoori Roti', 15, 'Whole wheat bread baked in tandoor.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (129, 'Plain Tava Roti', 15, 'Soft roti made on the tava.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (130, 'Butter Tandoori Roti', 20, 'Tandoori roti brushed with butter.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (131, 'Amul Butter Tava Roti', 20, 'Tava roti with Amul butter.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (132, 'Laccha Paratha Butter', 60, 'Flaky layered paratha with butter.', 'Roti', 'https://images.unsplash.com/photo-1626100134136-a3087ab084b8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (133, 'Butter Naan', 60, 'Fluffy naan glazed with butter.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (134, 'Plain Naan', 50, 'Soft leavened flatbread from the tandoor.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (135, 'Garlic Naan Butter', 80, 'Garlic naan brushed with butter.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (136, 'Cheese Garlic Naan', 100, 'Garlic naan loaded with melted cheese.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (137, 'Cheese Naan', 80, 'Soft naan stuffed with cheese.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (138, 'Missi Roti', 80, 'Spiced gram flour flatbread.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (139, 'Makka Roti', 50, 'Traditional corn flour flatbread.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (140, 'Bajara Roti', 60, 'Healthy pearl millet flatbread.', 'Roti', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (141, 'Special Manas Sabji', 280, 'Chef''s signature special vegetable curry.', 'Special Vegetable', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (142, 'Kaju Chana', 220, 'Cashews & chickpeas in a rich gravy.', 'Special Vegetable', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (143, 'Kaju Kari', 240, 'Cashews cooked in a creamy curry.', 'Special Vegetable', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (144, 'Navratan Korma', 220, 'Nine-jewel mixed veg in creamy korma.', 'Special Vegetable', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (145, 'Mushroom Kari', 220, 'Mushrooms in a rich flavourful curry.', 'Special Vegetable', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (146, 'Matar Mushroom', 200, 'Green peas & mushrooms in spiced gravy.', 'Special Vegetable', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (147, 'Kabuli Chana Masala', 200, 'White chickpeas in tangy masala.', 'Special Vegetable', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (148, 'Chana Kari (Kala Chana)', 200, 'Black chickpeas in a spiced curry.', 'Special Vegetable', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (149, 'Paneer Pasanda', 200, 'Stuffed paneer in a rich creamy gravy.', 'Special Vegetable', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (150, 'Cheese Butter Masala', 260, 'Cheese in a luscious butter masala gravy.', 'Special Vegetable', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (151, 'Plain Rice', 100, 'Perfectly steamed basmati rice.', 'Rice', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (152, 'Jeera Rice', 120, 'Basmati rice tempered with cumin seeds.', 'Rice', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (153, 'Veg. Pulav', 150, 'Mildly spiced rice with mixed vegetables.', 'Rice', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (154, 'Matar Pulav', 140, 'Fragrant rice cooked with green peas.', 'Rice', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (155, 'Kashmiri Pulav', 150, 'Sweet pulav with fruits & nuts.', 'Rice', 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (156, 'Veg Biryani', 180, 'Fragrant biryani with veggies & spices.', 'Rice', 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (157, 'Paneer Pulav', 180, 'Aromatic pulav loaded with paneer.', 'Rice', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (158, 'Dal Baati Chaach', 180, 'Rajasthani dal baati with chaach. Add Churma Laddu for ₹50.', 'Special Thali / Combo', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (159, 'Thali', 150, 'Wholesome thali with dal, sabzi, roti & rice.', 'Special Thali / Combo', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&h=600&q=80', TRUE),
  (160, 'Special Manas Thali', 250, 'Grand special thali with a variety of dishes.', 'Special Thali / Combo', 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&h=600&q=80', TRUE);

-- ========================================================
-- Schema DDL for 'customers' and 'orders' tables with RLS
-- ========================================================

-- 1. Create 'customers' table linked to auth.users
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Customers manage own profile'
  ) THEN
    CREATE POLICY "Customers manage own profile" ON customers
      FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

-- 2. Create 'orders' table linked to auth.users via user_id
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status INT DEFAULT 0,
  address TEXT,
  payment TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Authenticated insert orders'
  ) THEN
    CREATE POLICY "Authenticated insert orders" ON orders
      FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users select own orders'
  ) THEN
    CREATE POLICY "Users select own orders" ON orders
      FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

