import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'hell-classic',
    name: 'Hell Energy Classic',
    description: 'The legendary energy drink that started it all. High caffeine content with a classic tutti-frutti flavor profile for maximum performance.',
    price: 2.99,
    image: 'https://picsum.photos/seed/hell/800/800',
    category: 'energy',
    color: '#ff0000',
    ingredients: ['Water', 'Sugar', 'Caffeine', 'Taurine', 'Vitamins B2, B3, B5, B6, B12'],
    nutrition: { calories: 45, caffeine: 32, sugar: 11, sodium: 0.2 },
    benefits: ['Instant alertness', 'Enhanced focus', 'Metabolic support']
  },
  {
    id: 'dose-black',
    name: 'Dose Energy Black',
    description: 'A premium, high-intensity energy blend designed for extreme focus and sustained power. Zero sugar, maximum impact.',
    price: 3.49,
    image: 'https://picsum.photos/seed/dose/800/800',
    category: 'energy',
    color: '#1a1a1a',
    ingredients: ['Carbonated Water', 'Citric Acid', 'Caffeine', 'L-Theanine', 'Ginseng'],
    nutrition: { calories: 0, caffeine: 160, sugar: 0, sodium: 0.1 },
    benefits: ['Zero sugar crash', 'Sustained energy', 'Mental clarity']
  },
  {
    id: 'tiger-original',
    name: 'Tiger Energy Original',
    description: 'Unleash the beast within. A powerful combination of taurine and caffeine to keep you moving through the toughest challenges.',
    price: 2.79,
    image: 'https://picsum.photos/seed/tiger/800/800',
    category: 'energy',
    color: '#f59e0b',
    ingredients: ['Water', 'Sugar', 'Caffeine', 'Taurine', 'Inositol'],
    nutrition: { calories: 48, caffeine: 32, sugar: 11, sodium: 0.15 },
    benefits: ['Explosive power', 'Endurance boost', 'Quick recovery']
  },
  {
    id: 'sneak-purple',
    name: 'Sneak Purple Storm',
    description: 'The ultimate gaming fuel. Zero sugar, low calorie, and packed with vitamins and minerals for sharp mental performance.',
    price: 3.99,
    image: 'https://picsum.photos/seed/sneak/800/800',
    category: 'focus',
    color: '#7c3aed',
    ingredients: ['Maltodextrin', 'Caffeine', 'L-Tyrosine', 'Vitamins C, E, B12'],
    nutrition: { calories: 12, caffeine: 150, sugar: 0, sodium: 0.05 },
    benefits: ['Zero jitters', 'Enhanced reaction time', 'Mental stamina']
  },
  {
    id: 'prime-orange',
    name: 'Prime Hydration Orange',
    description: 'The viral hydration sensation. 10% coconut water, electrolytes, B vitamins, and BCAAs for recovery and thirst quenching.',
    price: 4.99,
    image: 'https://picsum.photos/seed/prime/800/800',
    category: 'hydration',
    color: '#ea580c',
    ingredients: ['Coconut Water', 'Electrolytes', 'BCAAs', 'B Vitamins'],
    nutrition: { calories: 20, caffeine: 0, sugar: 2, sodium: 0.01 },
    benefits: ['Rapid rehydration', 'Muscle recovery', 'Immune support']
  },
  {
    id: 'c4-performance',
    name: 'C4 Performance Energy',
    description: 'Explosive energy and performance. Powered by CarnoSyn Beta-Alanine and BetaPower for muscular endurance.',
    price: 3.89,
    image: 'https://picsum.photos/seed/c4/800/800',
    category: 'energy',
    color: '#facc15',
    ingredients: ['Beta-Alanine', 'Caffeine', 'Citrulline Malate', 'Betaine'],
    nutrition: { calories: 0, caffeine: 200, sugar: 0, sodium: 0.1 },
    benefits: ['Muscular endurance', 'Explosive energy', 'Pump support']
  },
  {
    id: 'redbull-classic',
    name: 'Red Bull Energy Drink',
    description: 'Red Bull gives you wings. The world-renowned functional beverage that vitalizes body and mind.',
    price: 3.29,
    image: 'https://picsum.photos/seed/redbull/800/800',
    category: 'energy',
    color: '#2563eb',
    ingredients: ['Water', 'Sugar', 'Caffeine', 'Taurine', 'B-Group Vitamins'],
    nutrition: { calories: 45, caffeine: 32, sugar: 11, sodium: 0.2 },
    benefits: ['Mental performance', 'Physical endurance', 'Alertness']
  },
  {
    id: 'xnpc-original',
    name: 'XNPC Original Energy',
    description: 'The dark horse of energy drinks. A unique blend of herbal extracts and caffeine for a smooth, jitter-free boost.',
    price: 2.49,
    image: 'https://picsum.photos/seed/xnpc/800/800',
    category: 'energy',
    color: '#4d7c0f',
    ingredients: ['Water', 'Herbal Extracts', 'Caffeine', 'Guarana'],
    nutrition: { calories: 40, caffeine: 30, sugar: 10, sodium: 0.1 },
    benefits: ['Natural energy', 'Smooth focus', 'No crash']
  },
  {
    id: 'recovery-blue',
    name: 'Zanoo Recovery Blue',
    description: 'Post-workout recovery formula with essential amino acids and electrolytes to rebuild and rehydrate.',
    price: 4.29,
    image: 'https://picsum.photos/seed/recovery/800/800',
    category: 'recovery',
    color: '#3b82f6',
    ingredients: ['Water', 'BCAAs', 'Electrolytes', 'L-Glutamine'],
    nutrition: { calories: 15, caffeine: 0, sugar: 0, sodium: 0.3 },
    benefits: ['Muscle repair', 'Hydration', 'Reduced soreness']
  },
  {
    id: 'brain-fuel',
    name: 'Zanoo Brain Fuel',
    description: 'Nootropic-enhanced focus drink for deep work and cognitive performance. Zero sugar, zero caffeine.',
    price: 4.99,
    image: 'https://picsum.photos/seed/brain/800/800',
    category: 'nootropic',
    color: '#ec4899',
    ingredients: ['Water', 'Alpha-GPC', 'Lion\'s Mane', 'Bacopa Monnieri'],
    nutrition: { calories: 5, caffeine: 0, sugar: 0, sodium: 0.05 },
    benefits: ['Memory support', 'Mental clarity', 'Neuroprotection']
  },
  {
    id: 'protein-shake-vanilla',
    name: 'Zanoo Protein Vanilla',
    description: 'High-protein, low-carb shake for muscle growth and satiety. Smooth vanilla flavor with 25g of whey isolate.',
    price: 5.49,
    image: 'https://picsum.photos/seed/protein/800/800',
    category: 'protein',
    color: '#fef3c7',
    ingredients: ['Whey Isolate', 'Natural Vanilla', 'Stevia', 'Vitamins'],
    nutrition: { calories: 120, caffeine: 0, sugar: 1, sodium: 0.2, protein: 25 },
    benefits: ['Muscle growth', 'Satiety', 'Quick meal replacement']
  }
];
