// Type Definitions
export interface WineOption {
  value: string;
  label: string;
}

export interface Region {
  name: string;
  description: string;
  climate: string;
  soil: string;
  specialties: string[];
  bestTime: string;
  image: string;
}

export interface WeatherPairing {
  description: string;
  recommendations: string[];
  tips: string;
}

// Wine Constants
export const WINE_CLARITY_OPTIONS: WineOption[] = [
  { value: 'clear', label: 'Clear' },
  { value: 'hazy', label: 'Hazy (faulty?)' },
];

export const WINE_INTENSITY_OPTIONS: WineOption[] = [
  { value: 'pale', label: 'Pale' },
  { value: 'medium', label: 'Medium' },
  { value: 'deep', label: 'Deep' },
];

export const WINE_COLOUR_OPTIONS: WineOption[] = [
  { value: 'lemon', label: 'Lemon' },
  { value: 'gold', label: 'Gold' },
  { value: 'amber', label: 'Amber' },
  { value: 'brown', label: 'Brown' },
  { value: 'pink', label: 'Pink' },
  { value: 'salmon', label: 'Salmon' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'garnet', label: 'Garnet' },
  { value: 'tawny', label: 'Tawny' },
];

export const NOSE_CONDITION_OPTIONS: WineOption[] = [
  { value: 'clean', label: 'Clean' },
  { value: 'unclean', label: 'Unclean' },
];

export const NOSE_INTENSITY_OPTIONS: WineOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'pronounced', label: 'Pronounced' },
];

export const PRIMARY_AROMA_OPTIONS = {
  floral: ['Rose', 'Violet', 'Lavender', 'Orange Blossom', 'Elderflower'],
  greenFruit: ['Apple', 'Pear', 'Gooseberry', 'Grape'],
  citrusFruit: ['Lemon', 'Lime', 'Orange', 'Grapefruit'],
  stoneFruit: ['Peach', 'Apricot', 'Nectarine'],
  tropicalFruit: ['Banana', 'Lychee', 'Mango', 'Passion Fruit'],
  redFruit: ['Red Cherry', 'Red Plum', 'Strawberry', 'Raspberry'],
  blackFruit: ['Black Cherry', 'Black Plum', 'Blackberry', 'Blueberry'],
  herbaceous: ['Grass', 'Bell Pepper', 'Asparagus'],
  herbal: ['Mint', 'Eucalyptus', 'Fennel', 'Dill'],
  spice: ['Black Pepper', 'Liquorice', 'Cinnamon', 'Clove'],
  fruitRipeness: ['Unripe', 'Ripe', 'Overripe'],
  other: ['Wet Stone', 'Mineral', 'Petrol', 'Kerosene'],
};

export const SECONDARY_AROMA_OPTIONS = {
  yeast: ['Bread', 'Biscuit', 'Toast'],
  malolactic: ['Butter', 'Cream', 'Cheese'],
  oak: ['Vanilla', 'Coconut', 'Smoke', 'Cedar', 'Tobacco'],
};

export const TERTIARY_AROMA_OPTIONS = {
  redWine: ['Leather', 'Earth', 'Mushroom', 'Game'],
  whiteWine: ['Honey', 'Petrol', 'Kerosene', 'Wax'],
  oxidised: ['Almond', 'Hazelnut', 'Walnut', 'Coffee', 'Caramel'],
};

export const PALATE_OPTIONS = {
  sweetness: [
    { value: 'bone-dry', label: 'Bone Dry' },
    { value: 'dry', label: 'Dry' },
    { value: 'off-dry', label: 'Off-Dry' },
    { value: 'medium-sweet', label: 'Medium Sweet' },
    { value: 'sweet', label: 'Sweet' },
    { value: 'very-sweet', label: 'Very Sweet' },
  ],
  acidity: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ],
  tannin: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ],
  alcohol: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ],
  body: [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'full', label: 'Full' },
  ],
  flavourIntensity: [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'pronounced', label: 'Pronounced' },
  ],
  finish: [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' },
  ],
};

export const QUALITY_OPTIONS: WineOption[] = [
  { value: 'faulty', label: 'Faulty' },
  { value: 'poor', label: 'Poor' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'good', label: 'Good' },
  { value: 'very-good', label: 'Very Good' },
  { value: 'outstanding', label: 'Outstanding' },
];

// Popular Wine Regions
export const POPULAR_REGIONS = [
  'Bordeaux, France',
  'Burgundy, France',
  'Champagne, France',
  'Tuscany, Italy',
  'Piedmont, Italy',
  'Rioja, Spain',
  'Napa Valley, USA',
  'Sonoma County, USA',
  'Barossa Valley, Australia',
  'Marlborough, New Zealand',
  'Mosel, Germany',
  'Douro Valley, Portugal',
  'Stellenbosch, South Africa',
  'Franschhoek, South Africa',
  'Paarl, South Africa',
  'Constantia, South Africa',
  'Swartland, South Africa',
  'Elgin, South Africa',
];

// South Africa Wine Regions
export const SOUTH_AFRICA_REGIONS: Region[] = [
  {
    name: 'Stellenbosch',
    description: 'The heart of South African wine country, known for Cabernet Sauvignon and Bordeaux-style blends',
    climate: 'Mediterranean',
    soil: 'Granite and shale',
    specialties: ['Cabernet Sauvignon', 'Merlot', 'Pinotage', 'Chenin Blanc'],
    bestTime: 'March to May (Harvest season)',
    image: '/Stellenbosch.jpg',
  },
  {
    name: 'Franschhoek',
    description: 'The French Corner, famous for its French Huguenot heritage and exceptional white wines',
    climate: 'Mediterranean with cool mountain influence',
    soil: 'Granite and sandstone',
    specialties: ['Chardonnay', 'Sauvignon Blanc', 'Semillon', 'Pinot Noir'],
    bestTime: 'February to April (Harvest season)',
    image: '/Franschhoek.jpg',
  },
  {
    name: 'Paarl',
    description: 'The Pearl of the Cape, known for its rich history and diverse wine styles',
    climate: 'Mediterranean with warm summers',
    soil: 'Granite and clay',
    specialties: ['Shiraz', 'Pinotage', 'Chenin Blanc', 'Cabernet Sauvignon'],
    bestTime: 'March to May (Harvest season)',
    image: '/Paarl.jpg',
  },
  {
    name: 'Constantia',
    description: 'The oldest wine region in South Africa, famous for its sweet wines and cool climate',
    climate: 'Cool maritime',
    soil: 'Granite and sandstone',
    specialties: ['Sauvignon Blanc', 'Semillon', 'Muscat', 'Pinot Noir'],
    bestTime: 'February to April (Harvest season)',
    image: '/Constantia.jpg',
  },
  {
    name: 'Elgin',
    description: 'A cool climate region known for its crisp white wines and elegant reds',
    climate: 'Cool maritime with high altitude',
    soil: 'Sandstone and shale',
    specialties: ['Sauvignon Blanc', 'Chardonnay', 'Pinot Noir', 'Syrah'],
    bestTime: 'March to May (Harvest season)',
    image: '/Elgin.jpg',
  },
  {
    name: 'Swartland',
    description: 'The wild west of South African wine, known for natural wines and old vines',
    climate: 'Mediterranean with hot summers',
    soil: 'Granite and shale',
    specialties: ['Chenin Blanc', 'Shiraz', 'Grenache', 'Cinsault'],
    bestTime: 'February to April (Harvest season)',
    image: '/Swartland.jpg',
  },
];

// Weather Impact on Wine Tasting
export const WEATHER_WINE_PAIRINGS: Record<string, WeatherPairing> = {
  sunny: {
    description: 'Perfect for light, refreshing wines',
    recommendations: ['Sauvignon Blanc', 'Pinot Grigio', 'Rosé', 'Prosecco'],
    tips: 'Serve slightly chilled, avoid heavy reds',
  },
  cloudy: {
    description: 'Great for medium-bodied wines',
    recommendations: ['Chardonnay', 'Pinot Noir', 'Merlot', 'Viognier'],
    tips: 'Room temperature for reds, slightly chilled for whites',
  },
  rainy: {
    description: 'Ideal for bold, warming wines',
    recommendations: ['Cabernet Sauvignon', 'Shiraz', 'Malbec', 'Zinfandel'],
    tips: 'Serve at room temperature, consider decanting',
  },
  hot: {
    description: 'Best for crisp, refreshing wines',
    recommendations: ['Riesling', 'Albariño', 'Gewürztraminer', 'Sparkling'],
    tips: 'Serve well chilled, avoid high alcohol wines',
  },
  cold: {
    description: 'Perfect for rich, full-bodied wines',
    recommendations: ['Barolo', 'Bordeaux', 'Port', 'Madeira'],
    tips: 'Serve at room temperature, consider warming slightly',
  },
};

// Weather API Configuration
export const WEATHER_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key',
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  UNITS: 'metric', // Celsius
  DEFAULT_CITY: 'Cape Town, South Africa',
};

// Popular Grape Varieties
export const POPULAR_GRAPES = [
  'Cabernet Sauvignon',
  'Merlot',
  'Pinot Noir',
  'Syrah/Shiraz',
  'Chardonnay',
  'Sauvignon Blanc',
  'Riesling',
  'Pinot Grigio',
  'Malbec',
  'Nebbiolo',
  'Sangiovese',
  'Tempranillo',
];

// Application Constants
export const APP_NAME = 'Wine Tasting Companion';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Professional wine tasting and management platform';

// Profile Images
export const PROFILE_IMAGES = {
  DEFAULT_AVATAR: '/George.jpg',
  FALLBACK_INITIALS: 'U',
};

// Export the profile image for easy access
export const PROFILE_IMAGE = PROFILE_IMAGES.DEFAULT_AVATAR;

// API Endpoints
export const API_ENDPOINTS = {
  WINE_API: 'https://api.wine.com/v2',
  HUGGING_FACE: 'https://api-inference.huggingface.co/models/distilgpt2',
  WEATHER_API: 'https://api.openweathermap.org/data/2.5/weather',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'wine_user_preferences',
  THEME: 'wine_theme',
  RECENT_WINES: 'wine_recent_wines',
  TASTING_SESSIONS: 'wine_tasting_sessions',
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#8B0000',
  secondary: '#D4AF37',
  accent: '#2E8B57',
  background: '#FFF8DC',
  text: '#2F2F2F',
};

// Rating System
export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

// Price Ranges
export const PRICE_RANGES = [
  { label: 'Under $20', value: [0, 20] },
  { label: '$20 - $50', value: [20, 50] },
  { label: '$50 - $100', value: [50, 100] },
  { label: '$100 - $200', value: [100, 200] },
  { label: 'Over $200', value: [200, Infinity] },
];

// Inventory Constants
export const MIN_STOCK_THRESHOLD = 5;
export const EXPIRY_THRESHOLD_DAYS = 30;