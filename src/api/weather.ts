// Weather Service for Wine Tasting Companion
// Integrates weather data with wine recommendations

import { WeatherData, WeatherWineRecommendation } from '@/types';
import { WEATHER_CONFIG } from '@/constants';

// Real-time weather data cache
let weatherCache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Popular wine regions for weather tracking
const WINE_REGIONS = [
  'Cape Town, South Africa',
  'Stellenbosch, South Africa',
  'Franschhoek, South Africa',
  'Bordeaux, France',
  'Burgundy, France',
  'Tuscany, Italy',
  'Piedmont, Italy',
  'Napa Valley, USA',
  'Sonoma, USA',
  'Barossa Valley, Australia',
  'Mendoza, Argentina',
  'La Rioja, Spain',
  'Douro Valley, Portugal',
  'Marlborough, New Zealand',
  'Mosel, Germany',
];

export class WeatherService {
  private static instance: WeatherService;
  private updateInterval: NodeJS.Timeout | null = null;
  private currentLocation: string = WEATHER_CONFIG.DEFAULT_CITY;
  private subscribers: ((weather: WeatherData) => void)[] = [];

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  // Start real-time weather updates
  startRealTimeUpdates(location?: string, intervalMs: number = 300000) { // 5 minutes default
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (location) {
      this.currentLocation = location;
    }

    // Initial update
    this.updateWeather();

    // Set up interval for real-time updates
    this.updateInterval = setInterval(() => {
      this.updateWeather();
    }, intervalMs);

    console.log(`🌤️ Real-time weather updates started for ${this.currentLocation} (every ${intervalMs / 1000}s)`);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🌤️ Real-time weather updates stopped');
    }
  }

  // Subscribe to weather updates
  subscribe(callback: (weather: WeatherData) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(weather: WeatherData) {
    this.subscribers.forEach(callback => callback(weather));
  }

  // Update weather data
  private async updateWeather() {
    try {
      const weather = await this.getCurrentWeather(this.currentLocation);
      this.notifySubscribers(weather);
    } catch (error) {
      console.error('Failed to update weather:', error);
    }
  }

  // Get current weather with caching
  async getCurrentWeather(location?: string): Promise<WeatherData> {
    const targetLocation = location || this.currentLocation;
    const cacheKey = targetLocation.toLowerCase();

    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🌤️ Using cached weather data for ${targetLocation}`);
      return cached.data;
    }

    try {
      // Real API call to OpenWeatherMap
      const response = await fetch(
        `${WEATHER_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(targetLocation)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API data to our format
      const weatherData: WeatherData = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: this.mapWeatherCondition(data.weather[0].main, data.weather[0].description),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        timestamp: Date.now(),
      };

      // Cache the result
      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
      });

      console.log(`🌤️ Fresh weather data loaded for ${targetLocation}`);
      return weatherData;

    } catch (error) {
      console.error('Weather API error:', error);
      
      // Fallback to demo data if API fails
      return this.getDemoWeatherData(targetLocation);
    }
  }

  // Get wine recommendations based on weather
  getWineRecommendations(weather: WeatherData): WeatherWineRecommendation {
    const condition = weather.condition.toLowerCase();
    const temp = weather.temperature;

    let recommendations: WeatherWineRecommendation;

    if (temp >= 30) {
      // Hot weather
      recommendations = {
        description: 'Perfect for light, refreshing wines',
        recommendations: [
          'Sauvignon Blanc',
          'Pinot Grigio',
          'Rosé',
          'Prosecco',
          'Albariño',
          'Riesling',
          'Gewürztraminer',
          'Sparkling Wine'
        ],
        tips: 'Serve well chilled, avoid high alcohol wines. Perfect for outdoor gatherings and summer events.',
        pairing: 'Light seafood, salads, fresh fruits',
        servingTemp: '6-8°C'
      };
    } else if (temp >= 20) {
      // Warm weather
      recommendations = {
        description: 'Great for medium-bodied wines',
        recommendations: [
          'Chardonnay',
          'Pinot Noir',
          'Merlot',
          'Viognier',
          'Grenache',
          'Tempranillo',
          'Sangiovese',
          'Rosé'
        ],
        tips: 'Room temperature for reds, slightly chilled for whites. Perfect for dinner service.',
        pairing: 'Grilled meats, pasta, Mediterranean cuisine',
        servingTemp: '12-16°C'
      };
    } else if (temp >= 10) {
      // Cool weather
      recommendations = {
        description: 'Ideal for bold, warming wines',
        recommendations: [
          'Cabernet Sauvignon',
          'Shiraz',
          'Malbec',
          'Zinfandel',
          'Barolo',
          'Bordeaux',
          'Port',
          'Madeira'
        ],
        tips: 'Serve at room temperature, consider decanting. Perfect for evening events.',
        pairing: 'Rich meats, stews, aged cheeses',
        servingTemp: '16-18°C'
      };
    } else {
      // Cold weather
      recommendations = {
        description: 'Perfect for rich, full-bodied wines',
        recommendations: [
          'Barolo',
          'Bordeaux',
          'Port',
          'Madeira',
          'Amarone',
          'Brunello',
          'Nebbiolo',
          'Aged Cabernet'
        ],
        tips: 'Serve at room temperature, consider warming slightly. Premium wine service.',
        pairing: 'Heavy dishes, chocolate desserts, aged cheeses',
        servingTemp: '18-20°C'
      };
    }

    // Adjust based on weather condition
    if (condition.includes('rain') || condition.includes('storm')) {
      recommendations.tips += ' Consider indoor wine tastings and cozy atmosphere.';
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      recommendations.tips += ' Outdoor wine service recommended.';
    }

    return recommendations;
  }

  // Get weather alerts for wine service
  getWeatherAlerts(weather: WeatherData): string[] {
    const alerts: string[] = [];
    const temp = weather.temperature;
    const windSpeed = weather.windSpeed;

    if (temp >= 35) {
      alerts.push('🌡️ High temperature alert: Consider chilled wine service and outdoor shade');
    }
    if (temp <= 5) {
      alerts.push('❄️ Low temperature alert: Premium wine service recommended');
    }
    if (windSpeed > 20) {
      alerts.push('💨 High winds: Secure outdoor wine service, consider indoor alternatives');
    }
    if (weather.condition.includes('rain') || weather.condition.includes('storm')) {
      alerts.push('🌧️ Weather alert: Move wine tastings indoors, adjust outdoor service');
    }

    return alerts;
  }

  // Get popular wine regions
  getWineRegions(): string[] {
    return WINE_REGIONS;
  }

  // Get weather forecast for wine event planning
  async getWeatherForecast(location: string, days: number = 5): Promise<WeatherData[]> {
    try {
      const response = await fetch(
        `${WEATHER_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}&cnt=${days * 8}` // 8 readings per day
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.list.map((item: any) => ({
        city: data.city.name,
        country: data.city.country,
        temperature: Math.round(item.main.temp),
        condition: this.mapWeatherCondition(item.weather[0].main, item.weather[0].description),
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        pressure: item.main.pressure,
        visibility: item.visibility / 1000,
        sunrise: new Date(data.city.sunrise * 1000),
        sunset: new Date(data.city.sunset * 1000),
        timestamp: item.dt * 1000,
      }));

    } catch (error) {
      console.error('Forecast API error:', error);
      return [];
    }
  }

  // Map weather conditions
  private mapWeatherCondition(main: string, description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('clear') || desc.includes('sunny')) return 'sunny';
    if (desc.includes('cloud')) return 'cloudy';
    if (desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
    if (desc.includes('snow')) return 'cold';
    if (desc.includes('thunder')) return 'stormy';
    if (desc.includes('fog') || desc.includes('mist')) return 'cloudy';
    
    return main.toLowerCase();
  }

  // Demo weather data for fallback
  private getDemoWeatherData(location: string): WeatherData {
    const conditions = ['sunny', 'cloudy', 'rainy', 'hot', 'cold'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      city: location.split(',')[0],
      country: location.split(',')[1]?.trim() || 'Demo',
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: randomCondition,
      description: `${randomCondition} weather`,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      pressure: Math.floor(Math.random() * 50) + 1000,
      visibility: Math.floor(Math.random() * 10) + 5,
      sunrise: new Date(),
      sunset: new Date(),
      timestamp: Date.now(),
    };
  }

  // Clear weather cache
  clearCache() {
    weatherCache.clear();
    console.log('🌤️ Weather cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: weatherCache.size,
      locations: Array.from(weatherCache.keys()),
    };
  }
}

// Export singleton instance
export const weatherService = WeatherService.getInstance(); 