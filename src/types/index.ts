// Wine Types
export interface Wine {
  id?: string;
  name: string;
  grape: string;
  region: string;
  vintage: number;
  rating: number;
  price?: number;
  imageUrl?: string;
  barcode?: string;
  winery?: string;
  notes?: string;
  timestamp: number;
  tasting: TastingNotes;
  userId?: string;
  inCellar?: boolean;
  createdAt?: number;
}

export interface TastingNotes {
  appearance: Appearance;
  nose: Nose;
  aromaFlavour: AromaFlavour;
  palate: Palate;
  conclusions: Conclusions;
  notes?: string;
  voiceNotes?: string;
}

export interface Appearance {
  clarity: string;
  intensity: string;
  colour: string;
}

export interface Nose {
  condition: string;
  intensity: string;
}

export interface AromaFlavour {
  primary: PrimaryAromas;
  secondary: SecondaryAromas;
  tertiary: TertiaryAromas;
}

export interface PrimaryAromas {
  floral: string;
  greenFruit: string;
  citrusFruit: string;
  stoneFruit: string;
  tropicalFruit: string;
  redFruit: string;
  blackFruit: string;
  herbaceous: string;
  herbal: string;
  spice: string;
  fruitRipeness: string;
  other: string;
}

export interface SecondaryAromas {
  yeast: string;
  malolactic: string;
  oak: string;
}

export interface TertiaryAromas {
  redWine: string;
  whiteWine: string;
  oxidised: string;
}

export interface Palate {
  sweetness: string;
  acidity: string;
  tannin: string;
  alcohol: string;
  body: string;
  flavourIntensity: string;
  finish: string;
}

export interface Conclusions {
  quality: string;
  readiness?: string;
  ageing?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: number;
}

export interface UserPreferences {
  favoriteRegions: string[];
  favoriteGrapes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preferredStyles: string[];
}

// Tasting Session Types
export interface TastingSession {
  id: string;
  name: string;
  date: number;
  wines: Wine[];
  participants: string[];
  notes: string;
  userId: string;
}

// Analytics Types
export interface WineAnalytics {
  totalWines: number;
  averageRating: number;
  favoriteRegions: RegionStats[];
  favoriteGrapes: GrapeStats[];
  ratingDistribution: RatingDistribution;
  monthlyTastings: MonthlyStats[];
}

export interface RegionStats {
  region: string;
  count: number;
  averageRating: number;
}

export interface GrapeStats {
  grape: string;
  count: number;
  averageRating: number;
}

export interface RatingDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface MonthlyStats {
  month: string;
  count: number;
  averageRating: number;
}

// API Types
export interface WineAPIResponse {
  wines: Wine[];
  total: number;
  page: number;
  limit: number;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Form Types
export interface WineFormData {
  name: string;
  grape: string;
  region: string;
  vintage: string;
  rating: number;
  price?: number;
  imageUrl?: string;
  barcode?: string;
  tasting: TastingNotes;
}

// UI Types
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Weather Types
export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold' | 'stormy';
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  sunrise: Date;
  sunset: Date;
  timestamp: number;
}

export interface WeatherWineRecommendation {
  description: string;
  recommendations: string[];
  tips: string;
  pairing: string;
  servingTemp: string;
}

// Wine Cellar Management Types
export interface WineCellar {
  id: string;
  userId: string;
  name: string;
  description?: string;
  location: string;
  temperature: number;
  humidity: number;
  capacity: number;
  createdAt: number;
  updatedAt: number;
}

export interface CellarWine extends Wine {
  cellarId: string;
  quantity: number;
  purchaseDate: number;
  purchasePrice: number;
  storageLocation: string; // e.g., "Top Shelf", "Bottom Rack", "Climate Controlled"
  agingPotential: number; // years
  drinkByDate?: number;
  notes?: string;
  isOpened: boolean;
  openedDate?: number;
}

export interface CellarAnalytics {
  totalWines: number;
  totalValue: number;
  averageAge: number;
  winesByRegion: { region: string; count: number; value: number }[];
  winesByGrape: { grape: string; count: number; value: number }[];
  agingWines: CellarWine[];
  readyToDrink: CellarWine[];
  overdueWines: CellarWine[];
  valueByPriceRange: { range: string; count: number; value: number }[];
}

export interface CellarRecommendation {
  type: 'aging' | 'drink' | 'purchase' | 'move';
  wine?: CellarWine;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
} 