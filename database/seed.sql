-- ============================================================
-- மளிகை உதவியாளர் - Seed Data
-- ============================================================

USE maligai_assistant;

-- Default owner (password: admin123)
INSERT INTO users (username, password_hash, name) VALUES
('admin', '$2b$10$rQZ9z1K8mXvN2pL4wY7uCeJhGdFsAiBoTnMkPlWqRvUxZcHyEjI6S', 'Shop Owner')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================================
-- PRODUCTS (40+ items)
-- ============================================================
INSERT INTO products (product_name, tamil_name, brand, size, unit, price, availability_status, notes) VALUES
-- Staples
('Sugar', 'சர்க்கரை', NULL, 1, 'kg', 48.00, 'AVAILABLE', NULL),
('Sugar', 'சர்க்கரை', NULL, 5, 'kg', 235.00, 'AVAILABLE', NULL),
('Rice', 'அரிசி', 'Ponni', 1, 'kg', 60.00, 'AVAILABLE', NULL),
('Rice', 'அரிசி', 'Sona Masoori', 5, 'kg', 320.00, 'AVAILABLE', NULL),
('Wheat Flour', 'கோதுமை மாவு', 'Aashirvaad', 1, 'kg', 55.00, 'AVAILABLE', NULL),
('Maida', 'மைதா', NULL, 1, 'kg', 38.00, 'AVAILABLE', NULL),
('Rava', 'ரவை', NULL, 500, 'g', 28.00, 'AVAILABLE', NULL),
('Salt', 'உப்பு', 'Tata', 1, 'kg', 20.00, 'AVAILABLE', NULL),

-- Oils
('Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', 'Fortune', 1, 'L', 140.00, 'AVAILABLE', NULL),
('Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', 'Fortune', 5, 'L', 680.00, 'AVAILABLE', NULL),
('Coconut Oil', 'தேங்காய் எண்ணெய்', 'Parachute', 500, 'ml', 95.00, 'AVAILABLE', NULL),
('Groundnut Oil', 'கடலை எண்ணெய்', 'Idhayam', 1, 'L', 190.00, 'OUT_OF_STOCK', NULL),

-- Dairy
('Milk', 'பால்', 'Aavin', 500, 'ml', 24.00, 'AVAILABLE', NULL),
('Milk', 'பால்', 'Aavin', 1, 'L', 48.00, 'AVAILABLE', NULL),
('Milk', 'பால்', 'Heritage', 500, 'ml', 25.00, 'AVAILABLE', NULL),
('Butter', 'வெண்ணெய்', 'Aavin', 100, 'g', 55.00, 'AVAILABLE', NULL),
('Curd', 'தயிர்', 'Aavin', 200, 'g', 18.00, 'AVAILABLE', NULL),

-- Beverages
('Tea', 'தேநீர் தூள்', 'Red Label', 250, 'g', 135.00, 'AVAILABLE', NULL),
('Tea', 'தேநீர் தூள்', 'Elaichi', 100, 'g', 60.00, 'OUT_OF_STOCK', NULL),
('Coffee', 'காபி தூள்', 'Bru', 200, 'g', 145.00, 'AVAILABLE', NULL),

-- Pulses / Dal
('Toor Dal', 'தூவரம் பருப்பு', NULL, 1, 'kg', 120.00, 'AVAILABLE', NULL),
('Urad Dal', 'உளுந்தம் பருப்பு', NULL, 500, 'g', 75.00, 'AVAILABLE', NULL),
('Chana Dal', 'கடலை பருப்பு', NULL, 500, 'g', 65.00, 'AVAILABLE', NULL),
('Moong Dal', 'பாசிப் பருப்பு', NULL, 500, 'g', 70.00, 'OUT_OF_STOCK', NULL),

-- Biscuits & Snacks
('Oreo Biscuit', 'ஓரியோ பிஸ்கட்', 'Oreo', 120, 'g', 30.00, 'AVAILABLE', NULL),
('Marie Biscuit', 'மேரி பிஸ்கட்', 'Britannia', 200, 'g', 25.00, 'AVAILABLE', NULL),
('Parle-G', 'பார்லே ஜி', 'Parle', 200, 'g', 20.00, 'AVAILABLE', NULL),
('Chips', 'சிப்ஸ்', 'Lays', 26, 'g', 20.00, 'AVAILABLE', NULL),

-- Noodles
('Noodles', 'நூடுல்ஸ்', 'Maggi', 70, 'g', 14.00, 'AVAILABLE', NULL),
('Noodles', 'நூடுல்ஸ்', 'Yippee', 70, 'g', 14.00, 'AVAILABLE', NULL),

-- Spices
('Turmeric', 'மஞ்சள் தூள்', 'Everest', 100, 'g', 38.00, 'AVAILABLE', NULL),
('Chilli Powder', 'மிளகாய் தூள்', 'Everest', 100, 'g', 42.00, 'AVAILABLE', NULL),
('Coriander Powder', 'தனியா தூள்', NULL, 100, 'g', 28.00, 'AVAILABLE', NULL),
('Pepper', 'மிளகு', NULL, 100, 'g', 65.00, 'OUT_OF_STOCK', NULL),

-- Personal Care
('Soap', 'சோப்பு', 'Lifebuoy', 100, 'g', 35.00, 'AVAILABLE', NULL),
('Shampoo', 'ஷாம்பு', 'Clinic Plus', 80, 'ml', 55.00, 'AVAILABLE', NULL),
('Toothpaste', 'பல் விளக்கி', 'Colgate', 100, 'g', 65.00, 'AVAILABLE', NULL),
('Toothbrush', 'பல் துலக்கி', 'Colgate', 1, 'piece', 35.00, 'AVAILABLE', NULL),

-- Household
('Detergent', 'துணி சோப்பு', 'Ariel', 500, 'g', 110.00, 'AVAILABLE', NULL),
('Dish Wash', 'பாத்திர சோப்பு', 'Vim', 250, 'ml', 55.00, 'AVAILABLE', NULL),
('Mosquito Coil', 'கொசு சுருள்', 'Good Knight', 10, 'piece', 45.00, 'AVAILABLE', NULL),

-- Vegetables (dry)
('Onion', 'வெங்காயம்', NULL, 1, 'kg', 40.00, 'AVAILABLE', NULL),
('Tomato', 'தக்காளி', NULL, 1, 'kg', 35.00, 'AVAILABLE', NULL),
('Potato', 'உருளைக்கிழங்கு', NULL, 1, 'kg', 42.00, 'AVAILABLE', NULL);

-- ============================================================
-- PRODUCT ALIASES
-- ============================================================

-- Sugar
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(1, 'சர்க்கரை', 'சர்க்கரை', 'TAMIL'),
(1, 'சுகர்', 'சுகர்', 'TAMIL'),
(1, 'Sugar', 'sugar', 'ENGLISH'),
(1, 'Sakkarai', 'sakkarai', 'ENGLISH'),
(2, 'சர்க்கரை', 'சர்க்கரை', 'TAMIL'),
(2, 'சுகர்', 'சுகர்', 'TAMIL'),
(2, 'Sugar', 'sugar', 'ENGLISH');

-- Rice
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(3, 'அரிசி', 'அரிசி', 'TAMIL'),
(3, 'Rice', 'rice', 'ENGLISH'),
(3, 'Arisi', 'arisi', 'ENGLISH'),
(3, 'Ponni', 'ponni', 'ENGLISH'),
(4, 'அரிசி', 'அரிசி', 'TAMIL'),
(4, 'Rice', 'rice', 'ENGLISH'),
(4, 'Sona Masoori', 'sona masoori', 'ENGLISH'),
(4, 'சோனா', 'சோனா', 'TAMIL');

-- Wheat Flour
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(5, 'கோதுமை மாவு', 'கோதுமை மாவு', 'TAMIL'),
(5, 'Wheat Flour', 'wheat flour', 'ENGLISH'),
(5, 'Atta', 'atta', 'ENGLISH'),
(5, 'ஆட்டா', 'ஆட்டா', 'TAMIL'),
(5, 'Aashirvaad', 'aashirvaad', 'ENGLISH');

-- Maida
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(6, 'மைதா', 'மைதா', 'TAMIL'),
(6, 'Maida', 'maida', 'ENGLISH'),
(6, 'All Purpose Flour', 'all purpose flour', 'ENGLISH');

-- Rava
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(7, 'ரவை', 'ரவை', 'TAMIL'),
(7, 'Rava', 'rava', 'ENGLISH'),
(7, 'Sooji', 'sooji', 'ENGLISH'),
(7, 'Semolina', 'semolina', 'ENGLISH');

-- Salt
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(8, 'உப்பு', 'உப்பு', 'TAMIL'),
(8, 'Salt', 'salt', 'ENGLISH'),
(8, 'Uppu', 'uppu', 'ENGLISH');

-- Sunflower Oil (Fortune 1L)
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(9, 'சூரியகாந்தி எண்ணெய்', 'சூரியகாந்தி எண்ணெய்', 'TAMIL'),
(9, 'எண்ணெய்', 'எண்ணெய்', 'TAMIL'),
(9, 'ஆயில்', 'ஆயில்', 'TAMIL'),
(9, 'ஃபார்ச்சூன் ஆயில்', 'ஃபார்ச்சூன் ஆயில்', 'TAMIL'),
(9, 'Fortune Oil', 'fortune oil', 'ENGLISH'),
(9, 'Sunflower Oil', 'sunflower oil', 'ENGLISH'),
(9, 'சன்ஃபிளவர் ஆயில்', 'சன்ஃபிளவர் ஆயில்', 'TAMIL'),
(10, 'ஃபார்ச்சூன் ஆயில்', 'ஃபார்ச்சூன் ஆயில்', 'TAMIL'),
(10, 'Fortune Oil', 'fortune oil', 'ENGLISH'),
(10, 'Sunflower Oil', 'sunflower oil', 'ENGLISH'),
(10, 'எண்ணெய்', 'எண்ணெய்', 'TAMIL');

-- Coconut Oil
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(11, 'தேங்காய் எண்ணெய்', 'தேங்காய் எண்ணெய்', 'TAMIL'),
(11, 'Coconut Oil', 'coconut oil', 'ENGLISH'),
(11, 'Parachute', 'parachute', 'ENGLISH'),
(11, 'பாராசூட்', 'பாராசூட்', 'TAMIL');

-- Groundnut Oil
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(12, 'கடலை எண்ணெய்', 'கடலை எண்ணெய்', 'TAMIL'),
(12, 'Groundnut Oil', 'groundnut oil', 'ENGLISH'),
(12, 'Idhayam', 'idhayam', 'ENGLISH');

-- Aavin Milk 500ml
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(13, 'ஆவின் பால்', 'ஆவின் பால்', 'TAMIL'),
(13, 'பால்', 'பால்', 'TAMIL'),
(13, 'Milk', 'milk', 'ENGLISH'),
(13, 'Aavin Milk', 'aavin milk', 'ENGLISH'),
(13, 'Aavin', 'aavin', 'ENGLISH'),
(14, 'ஆவின் பால்', 'ஆவின் பால்', 'TAMIL'),
(14, 'பால்', 'பால்', 'TAMIL'),
(14, 'Milk', 'milk', 'ENGLISH'),
(14, 'Aavin Milk', 'aavin milk', 'ENGLISH'),
(15, 'பால்', 'பால்', 'TAMIL'),
(15, 'Heritage Milk', 'heritage milk', 'ENGLISH'),
(15, 'ஹெரிடேஜ் பால்', 'ஹெரிடேஜ் பால்', 'TAMIL'),
(15, 'Milk', 'milk', 'ENGLISH');

-- Butter
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(16, 'வெண்ணெய்', 'வெண்ணெய்', 'TAMIL'),
(16, 'Butter', 'butter', 'ENGLISH');

-- Curd
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(17, 'தயிர்', 'தயிர்', 'TAMIL'),
(17, 'Curd', 'curd', 'ENGLISH'),
(17, 'Yogurt', 'yogurt', 'ENGLISH');

-- Tea
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(18, 'தேநீர் தூள்', 'தேநீர் தூள்', 'TAMIL'),
(18, 'தேநீர்', 'தேநீர்', 'TAMIL'),
(18, 'Tea', 'tea', 'ENGLISH'),
(18, 'Red Label', 'red label', 'ENGLISH'),
(18, 'சாய்', 'சாய்', 'TAMIL');

-- Coffee
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(20, 'காபி தூள்', 'காபி தூள்', 'TAMIL'),
(20, 'காபி', 'காபி', 'TAMIL'),
(20, 'Coffee', 'coffee', 'ENGLISH'),
(20, 'Bru', 'bru', 'ENGLISH');

-- Toor Dal
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(21, 'தூவரம் பருப்பு', 'தூவரம் பருப்பு', 'TAMIL'),
(21, 'பருப்பு', 'பருப்பு', 'TAMIL'),
(21, 'Toor Dal', 'toor dal', 'ENGLISH'),
(21, 'Arhar Dal', 'arhar dal', 'ENGLISH');

-- Urad Dal
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(22, 'உளுந்தம் பருப்பு', 'உளுந்தம் பருப்பு', 'TAMIL'),
(22, 'Urad Dal', 'urad dal', 'ENGLISH'),
(22, 'உளுந்து', 'உளுந்து', 'TAMIL');

-- Oreo
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(25, 'ஓரியோ பிஸ்கட்', 'ஓரியோ பிஸ்கட்', 'TAMIL'),
(25, 'ஓரியோ', 'ஓரியோ', 'TAMIL'),
(25, 'Oreo', 'oreo', 'ENGLISH'),
(25, 'பிஸ்கட்', 'பிஸ்கட்', 'TAMIL');

-- Maggi Noodles
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(29, 'மேகி', 'மேகி', 'TAMIL'),
(29, 'Maggi', 'maggi', 'ENGLISH'),
(29, 'நூடுல்ஸ்', 'நூடுல்ஸ்', 'TAMIL'),
(29, 'Noodles', 'noodles', 'ENGLISH');

-- Turmeric
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(31, 'மஞ்சள் தூள்', 'மஞ்சள் தூள்', 'TAMIL'),
(31, 'மஞ்சள்', 'மஞ்சள்', 'TAMIL'),
(31, 'Turmeric', 'turmeric', 'ENGLISH'),
(31, 'Haldi', 'haldi', 'ENGLISH');

-- Chilli Powder
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(32, 'மிளகாய் தூள்', 'மிளகாய் தூள்', 'TAMIL'),
(32, 'Chilli Powder', 'chilli powder', 'ENGLISH'),
(32, 'Red Chilli', 'red chilli', 'ENGLISH');

-- Soap
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(35, 'சோப்பு', 'சோப்பு', 'TAMIL'),
(35, 'Soap', 'soap', 'ENGLISH'),
(35, 'Lifebuoy', 'lifebuoy', 'ENGLISH');

-- Shampoo
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(36, 'ஷாம்பு', 'ஷாம்பு', 'TAMIL'),
(36, 'Shampoo', 'shampoo', 'ENGLISH');

-- Toothpaste
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(37, 'பல் விளக்கி', 'பல் விளக்கி', 'TAMIL'),
(37, 'Toothpaste', 'toothpaste', 'ENGLISH'),
(37, 'Colgate', 'colgate', 'ENGLISH');

-- Detergent
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(39, 'துணி சோப்பு', 'துணி சோப்பு', 'TAMIL'),
(39, 'Detergent', 'detergent', 'ENGLISH'),
(39, 'Ariel', 'ariel', 'ENGLISH'),
(39, 'வாஷிங் பவுடர்', 'வாஷிங் பவுடர்', 'TAMIL');

-- Onion
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(42, 'வெங்காயம்', 'வெங்காயம்', 'TAMIL'),
(42, 'Onion', 'onion', 'ENGLISH');

-- Tomato
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(43, 'தக்காளி', 'தக்காளி', 'TAMIL'),
(43, 'Tomato', 'tomato', 'ENGLISH');

-- Potato
INSERT INTO product_aliases (product_id, alias, normalized_alias, language) VALUES
(44, 'உருளைக்கிழங்கு', 'உருளைக்கிழங்கு', 'TAMIL'),
(44, 'Potato', 'potato', 'ENGLISH'),
(44, 'உருளை', 'உருளை', 'TAMIL');
