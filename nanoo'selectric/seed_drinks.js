import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const drinkProducts = [
  // Energy Drinks (17 products)
  {
    name: "Volt Energy Original",
    description: "Classic energy drink with a powerful kick of caffeine and taurine. Perfect for late-night gaming or intense workouts.",
    price: 350,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80",
    stock: 150,
    nutrition: { calories: 110, caffeine: 160, sugar: 27, sodium: 150 },
    benefits: ["Instant energy boost", "Improved alertness", "Enhanced physical performance"]
  },
  {
    name: "Volt Energy Zero Sugar",
    description: "All the power of Volt Original, but with zero sugar. Clean energy without the crash.",
    price: 350,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=180",
    stock: 120,
    nutrition: { calories: 10, caffeine: 160, sugar: 0, sodium: 150 },
    benefits: ["Zero sugar", "Sustained energy", "No crash"]
  },
  {
    name: "Surge Citrus Blast",
    description: "A refreshing citrus-flavored energy drink packed with B-vitamins and natural caffeine.",
    price: 400,
    category: "energy",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80",
    stock: 80,
    nutrition: { calories: 120, caffeine: 140, sugar: 25, sodium: 100 },
    benefits: ["Refreshing taste", "Vitamin B complex", "Natural caffeine"]
  },
  {
    name: "Surge Berry Rush",
    description: "Mixed berry energy drink designed for endurance athletes and high performers.",
    price: 400,
    category: "energy",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    stock: 90,
    nutrition: { calories: 120, caffeine: 140, sugar: 24, sodium: 100 },
    benefits: ["Endurance support", "Antioxidant rich", "Great taste"]
  },
  {
    name: "Nitro Cold Brew Energy",
    description: "Cold-brewed coffee infused with nitrogen and extra caffeine for a smooth, powerful lift.",
    price: 550,
    category: "energy",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80",
    stock: 60,
    nutrition: { calories: 15, caffeine: 200, sugar: 0, sodium: 10 },
    benefits: ["Smooth taste", "High caffeine", "Dairy-free"]
  },
  {
    name: "Nitro Vanilla Cream",
    description: "Our signature nitro cold brew with a splash of sweet vanilla cream.",
    price: 600,
    category: "energy",
    image: "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=800&q=80",
    stock: 50,
    nutrition: { calories: 90, caffeine: 180, sugar: 12, sodium: 45 },
    benefits: ["Creamy texture", "Sustained energy", "Delicious flavor"]
  },
  {
    name: "Quantum Apple Crisp",
    description: "Crisp green apple flavored energy drink with a proprietary energy blend.",
    price: 380,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=90",
    stock: 110,
    nutrition: { calories: 100, caffeine: 150, sugar: 20, sodium: 120 },
    benefits: ["Crisp flavor", "Fast acting", "Proprietary blend"]
  },
  {
    name: "Quantum Tropical Punch",
    description: "A tropical explosion of flavor and energy to keep you going all day.",
    price: 380,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=30",
    stock: 100,
    nutrition: { calories: 110, caffeine: 150, sugar: 22, sodium: 120 },
    benefits: ["Tropical taste", "All-day energy", "Vitamin C"]
  },
  {
    name: "Ignite Pre-Workout Can",
    description: "Carbonated pre-workout drink with beta-alanine and citrulline for maximum pump.",
    price: 450,
    category: "energy",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=270",
    stock: 75,
    nutrition: { calories: 5, caffeine: 300, sugar: 0, sodium: 50 },
    benefits: ["Extreme energy", "Muscle pump", "Enhanced focus"]
  },
  {
    name: "Ignite Watermelon Smash",
    description: "Watermelon flavored pre-workout energy drink for intense training sessions.",
    price: 450,
    category: "energy",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=330",
    stock: 85,
    nutrition: { calories: 5, caffeine: 300, sugar: 0, sodium: 50 },
    benefits: ["High caffeine", "Great for gym", "Zero sugar"]
  },
  {
    name: "Apex Energy Shot",
    description: "Concentrated 2oz energy shot for when you need a quick boost without the volume.",
    price: 250,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=60",
    stock: 200,
    nutrition: { calories: 0, caffeine: 200, sugar: 0, sodium: 10 },
    benefits: ["Fast acting", "Convenient size", "Zero calories"]
  },
  {
    name: "Apex Energy Shot - Grape",
    description: "Grape flavored concentrated energy shot.",
    price: 250,
    category: "energy",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=280",
    stock: 180,
    nutrition: { calories: 0, caffeine: 200, sugar: 0, sodium: 10 },
    benefits: ["Fast acting", "Grape flavor", "Zero calories"]
  },
  {
    name: "Titan Max Energy",
    description: "Our strongest energy drink yet, formulated for extreme sports and long shifts.",
    price: 500,
    category: "energy",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=10",
    stock: 60,
    nutrition: { calories: 150, caffeine: 350, sugar: 35, sodium: 200 },
    benefits: ["Maximum strength", "Long lasting", "Electrolyte infused"]
  },
  {
    name: "Titan Max Zero",
    description: "Maximum energy, zero sugar. For those who demand the most.",
    price: 500,
    category: "energy",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=200",
    stock: 70,
    nutrition: { calories: 10, caffeine: 350, sugar: 0, sodium: 200 },
    benefits: ["Maximum strength", "Zero sugar", "Electrolyte infused"]
  },
  {
    name: "Spark Sparkling Energy - Peach",
    description: "Lightly caffeinated sparkling water with a hint of peach.",
    price: 300,
    category: "energy",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=40",
    stock: 130,
    nutrition: { calories: 0, caffeine: 80, sugar: 0, sodium: 0 },
    benefits: ["Light energy", "Refreshing", "No artificial sweeteners"]
  },
  {
    name: "Spark Sparkling Energy - Lemon",
    description: "Lightly caffeinated sparkling water with a hint of lemon.",
    price: 300,
    category: "energy",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=60",
    stock: 140,
    nutrition: { calories: 0, caffeine: 80, sugar: 0, sodium: 0 },
    benefits: ["Light energy", "Refreshing", "No artificial sweeteners"]
  },
  {
    name: "Matcha Energy Elixir",
    description: "Natural energy from premium Japanese matcha green tea.",
    price: 650,
    category: "energy",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=120",
    stock: 40,
    nutrition: { calories: 50, caffeine: 70, sugar: 10, sodium: 5 },
    benefits: ["Natural energy", "Antioxidants", "Calm focus"]
  },

  // Hydration Drinks (17 products)
  {
    name: "HydroPlus Sport - Glacier",
    description: "Advanced hydration formula with 5 essential electrolytes to replenish what you sweat out.",
    price: 280,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80",
    stock: 200,
    nutrition: { calories: 50, caffeine: 0, sugar: 12, sodium: 250 },
    benefits: ["Rapid rehydration", "5 electrolytes", "Crisp taste"]
  },
  {
    name: "HydroPlus Sport - Fruit Punch",
    description: "Fruit punch flavored sports drink for optimal hydration during workouts.",
    price: 280,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80&auto=format&fit=crop&hue=350",
    stock: 180,
    nutrition: { calories: 50, caffeine: 0, sugar: 12, sodium: 250 },
    benefits: ["Rapid rehydration", "Great flavor", "Prevents cramping"]
  },
  {
    name: "AquaLyte Zero - Lemon Lime",
    description: "Zero sugar, zero calorie hydration beverage with maximum electrolytes.",
    price: 300,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=80",
    stock: 150,
    nutrition: { calories: 0, caffeine: 0, sugar: 0, sodium: 300 },
    benefits: ["Zero sugar", "High electrolytes", "Keto friendly"]
  },
  {
    name: "AquaLyte Zero - Orange",
    description: "Refreshing orange flavored zero sugar hydration drink.",
    price: 300,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=30",
    stock: 160,
    nutrition: { calories: 0, caffeine: 0, sugar: 0, sodium: 300 },
    benefits: ["Zero sugar", "Refreshing", "Keto friendly"]
  },
  {
    name: "Coconut Water Pure",
    description: "100% pure coconut water, nature's perfect hydration drink.",
    price: 450,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=50",
    stock: 90,
    nutrition: { calories: 45, caffeine: 0, sugar: 11, sodium: 40 },
    benefits: ["Natural hydration", "High potassium", "No added sugar"]
  },
  {
    name: "Coconut Water with Pineapple",
    description: "Pure coconut water blended with real pineapple juice.",
    price: 480,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=45",
    stock: 85,
    nutrition: { calories: 60, caffeine: 0, sugar: 14, sodium: 35 },
    benefits: ["Tropical flavor", "Natural hydration", "Vitamin C"]
  },
  {
    name: "Oasis Aloe Water",
    description: "Hydrating water infused with real aloe vera pulp for digestive health and hydration.",
    price: 350,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=150",
    stock: 110,
    nutrition: { calories: 70, caffeine: 0, sugar: 15, sodium: 20 },
    benefits: ["Digestive support", "Soothing", "Real aloe pulp"]
  },
  {
    name: "Oasis Aloe Water - Mango",
    description: "Mango flavored aloe water for a sweet and hydrating experience.",
    price: 350,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=40",
    stock: 100,
    nutrition: { calories: 80, caffeine: 0, sugar: 18, sodium: 20 },
    benefits: ["Digestive support", "Mango flavor", "Real aloe pulp"]
  },
  {
    name: "Revive Recovery Water",
    description: "Alkaline water (pH 9.5+) infused with trace minerals for optimal cellular hydration.",
    price: 200,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80&auto=format&fit=crop&hue=220",
    stock: 300,
    nutrition: { calories: 0, caffeine: 0, sugar: 0, sodium: 10 },
    benefits: ["Alkaline pH", "Trace minerals", "Pure hydration"]
  },
  {
    name: "Electrolyte Drops (Unflavored)",
    description: "Concentrated electrolyte drops to add to any beverage for instant hydration enhancement.",
    price: 850,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=200",
    stock: 50,
    nutrition: { calories: 0, caffeine: 0, sugar: 0, sodium: 500 },
    benefits: ["Customizable", "High concentration", "Travel friendly"]
  },
  {
    name: "HydraBoost Powder Packets - Lemon",
    description: "Box of 10 hydration powder packets. Just add to water for rapid rehydration.",
    price: 1200,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=60",
    stock: 40,
    nutrition: { calories: 35, caffeine: 0, sugar: 8, sodium: 350 },
    benefits: ["Rapid absorption", "Convenient", "Great value"]
  },
  {
    name: "HydraBoost Powder Packets - Berry",
    description: "Box of 10 berry flavored hydration powder packets.",
    price: 1200,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=300",
    stock: 45,
    nutrition: { calories: 35, caffeine: 0, sugar: 8, sodium: 350 },
    benefits: ["Rapid absorption", "Convenient", "Great value"]
  },
  {
    name: "Watermelon Hydration Juice",
    description: "Cold-pressed watermelon juice, naturally rich in electrolytes and L-citrulline.",
    price: 550,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=340",
    stock: 60,
    nutrition: { calories: 80, caffeine: 0, sugar: 16, sodium: 10 },
    benefits: ["Cold-pressed", "Natural recovery", "Refreshing"]
  },
  {
    name: "Cucumber Mint Cooler",
    description: "A spa-inspired hydrating beverage with real cucumber extract and mint.",
    price: 400,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=140",
    stock: 80,
    nutrition: { calories: 20, caffeine: 0, sugar: 4, sodium: 5 },
    benefits: ["Spa flavor", "Lightly sweetened", "Cooling effect"]
  },
  {
    name: "Sea Salt & Lime Hydrator",
    description: "Natural hydration using Celtic sea salt and fresh lime juice.",
    price: 380,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=100",
    stock: 95,
    nutrition: { calories: 15, caffeine: 0, sugar: 2, sodium: 400 },
    benefits: ["Natural electrolytes", "Tart flavor", "No artificial ingredients"]
  },
  {
    name: "Endurance Hydration Mix - Tub",
    description: "30-serving tub of our premium endurance hydration mix for serious athletes.",
    price: 3500,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=210",
    stock: 25,
    nutrition: { calories: 40, caffeine: 0, sugar: 10, sodium: 300 },
    benefits: ["Bulk value", "Formulated for endurance", "Multiple carb sources"]
  },
  {
    name: "Kids Hydration Box - Apple",
    description: "Kid-friendly hydration drink with lower sodium and natural apple flavor. Pack of 6.",
    price: 1500,
    category: "hydration",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80&auto=format&fit=crop&hue=90",
    stock: 40,
    nutrition: { calories: 30, caffeine: 0, sugar: 6, sodium: 100 },
    benefits: ["Kid friendly", "Lower sodium", "Natural flavor"]
  },

  // Focus Drinks (16 products)
  {
    name: "Clarity Nootropic Drink - Blueberry",
    description: "Brain-boosting beverage formulated with L-Theanine, Alpha-GPC, and Lion's Mane mushroom extract.",
    price: 600,
    category: "focus",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=240",
    stock: 80,
    nutrition: { calories: 25, caffeine: 80, sugar: 4, sodium: 20 },
    benefits: ["Enhanced focus", "Cognitive support", "No jitters"]
  },
  {
    name: "Clarity Nootropic Drink - Peach",
    description: "Peach flavored cognitive enhancer for deep work and study sessions.",
    price: 600,
    category: "focus",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=35",
    stock: 85,
    nutrition: { calories: 25, caffeine: 80, sugar: 4, sodium: 20 },
    benefits: ["Enhanced focus", "Cognitive support", "Smooth energy"]
  },
  {
    name: "FocusBrew Smart Coffee",
    description: "Premium coffee infused with MCT oil and L-Tyrosine for sustained mental clarity.",
    price: 750,
    category: "focus",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80",
    stock: 50,
    nutrition: { calories: 90, caffeine: 150, sugar: 0, sodium: 15 },
    benefits: ["Sustained clarity", "MCT oil benefits", "Premium coffee"]
  },
  {
    name: "Zenith Focus Shot",
    description: "2oz shot packed with B-vitamins, Bacopa Monnieri, and Rhodiola Rosea for immediate mental sharpness.",
    price: 350,
    category: "focus",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=280",
    stock: 120,
    nutrition: { calories: 5, caffeine: 50, sugar: 0, sodium: 5 },
    benefits: ["Immediate sharpness", "Adaptogens", "Low caffeine"]
  },
  {
    name: "Matcha Mind",
    description: "Ceremonial grade matcha blended with Ginkgo Biloba for calm, focused energy.",
    price: 800,
    category: "focus",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=110",
    stock: 40,
    nutrition: { calories: 40, caffeine: 60, sugar: 5, sodium: 10 },
    benefits: ["Calm energy", "Antioxidant rich", "Memory support"]
  },
  {
    name: "NeuroSpark Sparkling - Grapefruit",
    description: "Sparkling water infused with nootropics and a light grapefruit flavor.",
    price: 450,
    category: "focus",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=15",
    stock: 90,
    nutrition: { calories: 10, caffeine: 40, sugar: 0, sodium: 0 },
    benefits: ["Light focus", "Refreshing", "Zero sugar"]
  },
  {
    name: "NeuroSpark Sparkling - Blackberry",
    description: "Sparkling water infused with nootropics and blackberry flavor.",
    price: 450,
    category: "focus",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=290",
    stock: 85,
    nutrition: { calories: 10, caffeine: 40, sugar: 0, sodium: 0 },
    benefits: ["Light focus", "Refreshing", "Zero sugar"]
  },
  {
    name: "Gamer's Edge - Sour Apple",
    description: "Formulated specifically for gamers to improve reaction time and reduce eye strain (contains Lutein).",
    price: 500,
    category: "focus",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=100",
    stock: 150,
    nutrition: { calories: 20, caffeine: 120, sugar: 0, sodium: 50 },
    benefits: ["Reaction time", "Eye health", "Zero sugar"]
  },
  {
    name: "Gamer's Edge - Blue Raspberry",
    description: "Blue raspberry flavored focus drink for long gaming sessions.",
    price: 500,
    category: "focus",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=220",
    stock: 160,
    nutrition: { calories: 20, caffeine: 120, sugar: 0, sodium: 50 },
    benefits: ["Reaction time", "Eye health", "Zero sugar"]
  },
  {
    name: "Flow State Elixir",
    description: "A unique blend of adaptogens and nootropics designed to help you enter and maintain a flow state.",
    price: 700,
    category: "focus",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=260",
    stock: 60,
    nutrition: { calories: 30, caffeine: 30, sugar: 5, sodium: 15 },
    benefits: ["Deep work", "Stress reduction", "Creative boost"]
  },
  {
    name: "Keto Brain Fuel",
    description: "Exogenous ketones and MCTs in a convenient drink to fuel your brain on a ketogenic diet.",
    price: 850,
    category: "focus",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80&auto=format&fit=crop&hue=45",
    stock: 40,
    nutrition: { calories: 100, caffeine: 0, sugar: 0, sodium: 100 },
    benefits: ["Ketone energy", "Mental clarity", "Caffeine free"]
  },
  {
    name: "Yerba Mate Focus Blend",
    description: "Traditional South American Yerba Mate brewed with mint for natural, sustained focus.",
    price: 450,
    category: "focus",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80&auto=format&fit=crop&hue=70",
    stock: 70,
    nutrition: { calories: 40, caffeine: 85, sugar: 8, sodium: 5 },
    benefits: ["Natural caffeine", "Antioxidants", "Sustained energy"]
  },
  {
    name: "Lion's Mane Cold Brew",
    description: "Cold brew coffee infused with dual-extracted Lion's Mane mushroom.",
    price: 650,
    category: "focus",
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=800&q=80",
    stock: 55,
    nutrition: { calories: 15, caffeine: 180, sugar: 0, sodium: 10 },
    benefits: ["Neurogenesis support", "High caffeine", "Smooth taste"]
  },
  {
    name: "Focus Powder Mix - Citrus",
    description: "30-serving tub of our proprietary focus blend. Mix with water.",
    price: 4000,
    category: "focus",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80&auto=format&fit=crop&hue=50",
    stock: 30,
    nutrition: { calories: 10, caffeine: 100, sugar: 0, sodium: 20 },
    benefits: ["Cost effective", "Customizable dose", "Comprehensive formula"]
  },
  {
    name: "Study Buddy - Strawberry",
    description: "Caffeine-free focus drink utilizing Choline and B-Vitamins for late-night studying.",
    price: 400,
    category: "focus",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80&auto=format&fit=crop&hue=340",
    stock: 80,
    nutrition: { calories: 20, caffeine: 0, sugar: 2, sodium: 15 },
    benefits: ["Caffeine free", "Memory support", "Sleep friendly"]
  },
  {
    name: "Alpha Brain Wave",
    description: "Premium nootropic drink designed to promote alpha brain waves for relaxed alertness.",
    price: 750,
    category: "focus",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bcc61f4?w=800&q=80&auto=format&fit=crop&hue=200",
    stock: 45,
    nutrition: { calories: 15, caffeine: 50, sugar: 0, sodium: 10 },
    benefits: ["Relaxed alertness", "Stress support", "Premium ingredients"]
  }
];

async function seed() {
  try {
    console.log('Deleting existing products...');
    const snapshot = await getDocs(collection(db, 'products'));
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'products', document.id));
    }
    console.log('Existing products deleted.');

    console.log('Adding new drink products...');
    for (const product of drinkProducts) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log(`Successfully added ${drinkProducts.length} drink products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seed();
