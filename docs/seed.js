export const SEED_DISHES = [
  // Salads
  { category: "salads", titleRu: "Салат огуречный", titleDe: "Gurkensalat", ingredientsRu: ["огурцы", "чеснок", "сметана", "укроп"], ingredientsDe: ["Gurken", "Knoblauch", "Sauerrahm", "Dill"], kcal: 120, weight: 200, imageUrl: "./images/salad_cucumber.png" },
  { category: "salads", titleRu: "Туна салат", titleDe: "Thunfischsalat", ingredientsRu: ["тунец", "салат", "помидоры", "чеснок", "горчица", "творожный сыр", "яйца"], ingredientsDe: ["Thunfisch", "Salat", "Tomaten", "Knoblauch", "Senf", "Frischkäse", "Eier"], kcal: 340, weight: 250, imageUrl: "./images/salad_tuna.png" },
  { category: "salads", titleRu: "Салат с морковью", titleDe: "Karottensalat", ingredientsRu: ["морковь", "лук красный", "чеснок", "хумус", "бобы", "курица"], ingredientsDe: ["Karotten", "Rote Zwiebeln", "Knoblauch", "Hummus", "Bohnen", "Hähnchen"], kcal: 280, weight: 250, imageUrl: "./images/salad_carrot.png" },
  { category: "salads", titleRu: "Салат свекольный", titleDe: "Rote-Bete-Salat", ingredientsRu: ["свёкла", "чеснок", "сметана", "укроп", "масло оливковое"], ingredientsDe: ["Rote Bete", "Knoblauch", "Sauerrahm", "Dill", "Olivenöl"], kcal: 180, weight: 200, imageUrl: "./images/salad_beet.png" },
  { category: "salads", titleRu: "Обычный салат с капустой", titleDe: "Einfacher Krautsalat", ingredientsRu: ["капуста", "огурцы", "помидоры", "сметана"], ingredientsDe: ["Kohl", "Gurken", "Tomaten", "Sauerrahm"], kcal: 110, weight: 200, imageUrl: "./images/salad_cabbage.png" },

  // Soups
  { category: "soups", titleRu: "Суп с фрикадельками", titleDe: "Frikadellensuppe", ingredientsRu: ["фарш", "чеснок", "картофель", "морковь", "лук"], ingredientsDe: ["Hackfleisch", "Knoblauch", "Kartoffeln", "Karotten", "Zwiebeln"], kcal: 320, weight: 350, imageUrl: "./images/soup_meatballs.png" },
  { category: "soups", titleRu: "Суп с лососем", titleDe: "Lachssuppe", ingredientsRu: ["лосось", "картофель", "морковь", "лук", "зелень"], ingredientsDe: ["Lachs", "Kartoffeln", "Karotten", "Zwiebeln", "Kräuter"], kcal: 280, weight: 350, imageUrl: "./images/soup_salmon.png" },
  { category: "soups", titleRu: "Суп с курицей и грибами", titleDe: "Hühnersuppe mit Pilzen", ingredientsRu: ["курица", "картофель", "морковь", "лук"], ingredientsDe: ["Hähnchen", "Kartoffeln", "Karotten", "Zwiebeln"], kcal: 240, weight: 350, imageUrl: "./images/soup_chicken_mushroom.png" },

  // Mains
  { category: "mains", titleRu: "Паста с курицей и грибами в сливках", titleDe: "Pasta mit Hähnchen und Pilzen in Sahne", ingredientsRu: ["спагетти", "курица", "грибы", "лук", "творожный сыр"], ingredientsDe: ["Spaghetti", "Hähnchen", "Pilze", "Zwiebeln", "Frischkäse"], kcal: 680, weight: 350, imageUrl: "./images/mains_pasta_chicken.png" },
  { category: "mains", titleRu: "Паста с томатами и тунцом/фаршем", titleDe: "Pasta mit Tomaten und Thunfisch/Hackfleisch", ingredientsRu: ["макароны", "помидоры", "тунец/фарш", "сливки", "лук"], ingredientsDe: ["Nudeln", "Tomaten", "Thunfisch/Hackfleisch", "Sahne", "Zwiebeln"], kcal: 620, weight: 350, imageUrl: "./images/mains_pasta_tuna.png" },
  { category: "mains", titleRu: "Гречка с курицей и грибами", titleDe: "Buchweizen mit Hähnchen und Pilzen", ingredientsRu: ["гречка", "курица", "грибы", "лук"], ingredientsDe: ["Buchweizen", "Hähnchen", "Pilze", "Zwiebeln"], kcal: 450, weight: 350, imageUrl: "./images/mains_buckwheat.png" },
  { category: "mains", titleRu: "Булгур плов", titleDe: "Bulgur-Pilaw", ingredientsRu: ["булгур", "курица", "морковь"], ingredientsDe: ["Bulgur", "Hähnchen", "Karotten"], kcal: 420, weight: 300, imageUrl: "./images/mains_bulgur.png" },
  { category: "mains", titleRu: "Рис с овощами яйцом и ветчиной", titleDe: "Reis mit Gemüse, Ei und Schinken", ingredientsRu: ["рис", "овощная смесь", "ветчина"], ingredientsDe: ["Reis", "Gemüsemischung", "Schinken"], kcal: 480, weight: 350, imageUrl: "./images/mains_rice.png" },
  { category: "mains", titleRu: "Пюре с котлетами", titleDe: "Püree mit Frikadellen", ingredientsRu: ["картофель", "сливочное масло", "фарш", "мука", "специи", "чеснок", "лук"], ingredientsDe: ["Kartoffeln", "Butter", "Hackfleisch", "Mehl", "Gewürze", "Knoblauch", "Zwiebeln"], kcal: 750, weight: 400, imageUrl: "./images/mains_puree.png" },
  { category: "mains", titleRu: "Жульен с грибами", titleDe: "Pilzjulienne", ingredientsRu: ["картофель", "грибы", "сливки", "курица", "лук"], ingredientsDe: ["Kartoffeln", "Pilze", "Sahne", "Hähnchen", "Zwiebeln"], kcal: 580, weight: 350, imageUrl: "./images/mains_julienne.png" },
  { category: "mains", titleRu: "Овощи запечённые", titleDe: "Gebackenes Gemüse", ingredientsRu: ["брокколи", "цветная капуста"], ingredientsDe: ["Brokkoli", "Blumenkohl"], kcal: 120, weight: 250, imageUrl: "./images/mains_veggies.png" },

  // Meat
  { category: "meat", titleRu: "Упштицы в каймаке", titleDe: "Uštipci in Kajmak", ingredientsRu: ["фарш", "чеснок", "лук", "перец острый", "сметана", "творожный сыр", "масло оливковое"], ingredientsDe: ["Hackfleisch", "Knoblauch", "Zwiebeln", "Chili", "Sauerrahm", "Frischkäse", "Olivenöl"], kcal: 720, weight: 250, imageUrl: "./images/meat_ustipci.png" },
  { category: "meat", titleRu: "Куриные ножки", titleDe: "Hähnchenschenkel", ingredientsRu: ["куриные ножки", "масло"], ingredientsDe: ["Hähnchenschenkel", "Öl"], kcal: 480, weight: 200, imageUrl: "./images/meat_chicken_legs.png" },
  { category: "meat", titleRu: "Сердечки", titleDe: "Herzen", ingredientsRu: ["сердечки куриные", "сметана", "лук", "масло"], ingredientsDe: ["Hühnerherzen", "Sauerrahm", "Zwiebeln", "Öl"], kcal: 510, weight: 250, imageUrl: "./images/meat_hearts.png" },

  // Breakfast
  { category: "breakfast", titleRu: "Омлет с грибами", titleDe: "Pilzomelett", ingredientsRu: ["яйца", "лук", "грибы"], ingredientsDe: ["Eier", "Zwiebeln", "Pilze"], kcal: 310, weight: 250, imageUrl: "./images/breakfast_omelet_mushrooms.png" },
  { category: "breakfast", titleRu: "Омлет с сардинами", titleDe: "Sardinenomelett", ingredientsRu: ["яйца", "творожный сыр", "сардины", "молоко"], ingredientsDe: ["Eier", "Frischkäse", "Sardinen", "Milch"], kcal: 480, weight: 280, imageUrl: "./images/breakfast_omelet_sardines.png" },
  { category: "breakfast", titleRu: "Омлет обычный", titleDe: "Omelett", ingredientsRu: ["яйца", "молоко"], ingredientsDe: ["Eier", "Milch"], kcal: 260, weight: 200, imageUrl: "./images/breakfast_omelet_plain.png" },
  { category: "breakfast", titleRu: "Запеканка творожная", titleDe: "Quarkauflauf", ingredientsRu: ["творог мягкий", "яйца", "мед"], ingredientsDe: ["Weichquark", "Eier", "Honig"], kcal: 340, weight: 200, imageUrl: "./images/breakfast_casserole.png" },
  { category: "breakfast", titleRu: "Сырники", titleDe: "Syrniki", ingredientsRu: ["творог", "мука", "рисовый сахар", "яйцо", "ваниль"], ingredientsDe: ["Quark", "Mehl", "Reiszucker", "Ei", "Vanille"], kcal: 410, weight: 200, imageUrl: "./images/breakfast_syrniki.png" },
  { category: "breakfast", titleRu: "Блины мясо/творог/яблоки/вишня", titleDe: "Pfannkuchen Fleisch/Quark/Apfel/Kirsche", ingredientsRu: ["мука", "молоко", "масло", "яйца", "сахар рисовый", "творог с медом", "фарш с луком", "вишня"], ingredientsDe: ["Mehl", "Milch", "Öl", "Eier", "Reiszucker", "Quark mit Honig", "Hackfleisch mit Zwiebeln", "Kirschen"], kcal: 540, weight: 250, imageUrl: "./images/breakfast_pancakes.png" },
  { category: "breakfast", titleRu: "Овсянка с яблоками", titleDe: "Haferbrei mit Apfel", ingredientsRu: ["овсянка", "яблоки", "масло", "молоко"], ingredientsDe: ["Haferflocken", "Äpfel", "Butter", "Milch"], kcal: 380, weight: 300, imageUrl: "./images/breakfast_oatmeal.png" },
  { category: "breakfast", titleRu: "Тосты", titleDe: "Toasts", ingredientsRu: ["хлеб из чечевицы", "яйца", "сметана", "тунец"], ingredientsDe: ["Linsenbrot", "Eier", "Sauerrahm", "Thunfisch"], kcal: 490, weight: 250, imageUrl: "./images/breakfast_toasts.png" },

  // Bread
  { category: "bread", titleRu: "Хлеб из чечевицы", titleDe: "Linsenbrot", ingredientsRu: ["чечевица", "яйца"], ingredientsDe: ["Linsen", "Eier"], kcal: 220, weight: 120, imageUrl: "./images/bread_lentil.png" },

  // Desserts
  { category: "desserts", titleRu: "Морковный кекс", titleDe: "Karottenkuchen", ingredientsRu: ["овсянка", "грецкие орехи", "морковь", "яблоко"], ingredientsDe: ["Haferflocken", "Walnüsse", "Karotten", "Apfel"], kcal: 340, weight: 120, imageUrl: "./images/dessert_carrot_cake.png" },
  { category: "desserts", titleRu: "Лимонный кекс", titleDe: "Zitronenkuchen", ingredientsRu: ["лимон", "творог", "яйцо", "мука рисовая"], ingredientsDe: ["Zitrone", "Quark", "Ei", "Reismehl"], kcal: 310, weight: 120, imageUrl: "./images/dessert_lemon_cake.png" },
  { category: "desserts", titleRu: "Ватрушки с вишней", titleDe: "Kirschtaschen", ingredientsRu: ["тесто", "вишня", "сахар"], ingredientsDe: ["Teig", "Kirschen", "Zucker"], kcal: 430, weight: 140, imageUrl: "./images/dessert_cherry_buns.png" },
  { category: "desserts", titleRu: "Банановый кекс", titleDe: "Bananenkuchen", ingredientsRu: ["бананы", "какао", "мука"], ingredientsDe: ["Bananen", "Kakao", "Mehl"], kcal: 380, weight: 120, imageUrl: "./images/dessert_banana_cake.png" },
];
