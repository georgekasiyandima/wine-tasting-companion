// Weather Service for Wine Tasting Companion
// Integrates weather data with wine recommendations

import { WeatherData, WeatherWineRecommendation, ForecastData } from '@/types';

// Use environment variables directly instead of WEATHER_CONFIG
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const UNITS = 'metric';

// Real-time weather data cache
const weatherCache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
const forecastCache: Map<string, { data: ForecastData[]; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cruise ship locations for automatic weather tracking
const CRUISE_LOCATIONS = [
  'Cape Town, South Africa',
  'Stellenbosch, South Africa',
  'Franschhoek, South Africa',
  'Barcelona, Spain',
  'Marseille, France',
  'Genoa, Italy',
  'Venice, Italy',
  'Athens, Greece',
  'Dubrovnik, Croatia',
  'Santorini, Greece',
  'Miami, USA',
  'San Juan, Puerto Rico',
  'St. Maarten',
  'Barbados',
  'Jamaica',
];

export class WeatherService {
  private static instance: WeatherService;
  private updateInterval: NodeJS.Timeout | null = null;
  private currentLocation: string = 'Cape Town, South Africa';
  private subscribers: ((weather: WeatherData) => void)[] = [];

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  // Start real-time weather updates
  startRealTimeUpdates(location?: string, intervalMs: number = 300000): () => void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (location) {
      this.currentLocation = location;
    }

    // Initial update
    this.updateWeather().catch((error) => console.error('Initial weather update failed:', error));

    // Set up interval for real-time updates
    this.updateInterval = setInterval(() => {
      this.updateWeather().catch((error) => console.error('Real-time weather update failed:', error));
    }, intervalMs);

    console.log(`🌤️ Real-time weather updates started for ${this.currentLocation} (every ${intervalMs / 1000}s)`);

    return () => this.stopRealTimeUpdates();
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
  subscribe(callback: (weather: WeatherData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers(weather: WeatherData) {
    this.subscribers.forEach((callback) => {
      try {
        callback(weather);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Update weather data
  private async updateWeather() {
    const weather = await this.getCurrentWeather(this.currentLocation);
    this.notifySubscribers(weather);
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
      const response = await fetch(
        `${API_URL}/weather?q=${encodeURIComponent(targetLocation)}&appid=${API_KEY}&units=${UNITS}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

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
    } catch (error: any) {
      console.error('Weather API error:', error);
      return this.getDemoWeatherData(targetLocation);
    }
  }

  // Get 5-day weather forecast
  async getForecast(location: string): Promise<ForecastData[]> {
    const cacheKey = location.toLowerCase();
    const cached = forecastCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🌤️ Using cached forecast data for ${location}`);
      return cached.data;
    }

    try {
      const response = await fetch(
        `${API_URL}/forecast?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=${UNITS}`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Filter for one reading per day (noon)
      const forecastData = data.list
        .filter((item: any) => item.dt_txt.includes('12:00:00'))
        .slice(0, 5)
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toISOString(),
          temperature: Math.round(item.main.temp),
          condition: this.mapWeatherCondition(item.weather[0].main, item.weather[0].description),
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        }));

      forecastCache.set(cacheKey, {
        data: forecastData,
        timestamp: Date.now(),
      });

      console.log(`🌤️ Fresh forecast data loaded for ${location}`);
      return forecastData;
    } catch (error: any) {
      console.error('Forecast API error:', error);
      return [];
    }
  }

  // Get wine recommendations based on weather
  getWineRecommendations(weather: WeatherData): WeatherWineRecommendation {
    const condition = weather.condition.toLowerCase();
    const temp = weather.temperature;

    let recommendations: WeatherWineRecommendation;

    if (temp >= 30) {
      recommendations = {
        description: 'Perfect for light, refreshing wines',
        recommendations: ['Sauvignon Blanc', 'Pinot Grigio', 'Rosé', 'Prosecco', 'Albariño', 'Riesling', 'Gewürztraminer', 'Sparkling Wine'],
        tips: 'Serve well chilled, avoid high alcohol wines. Perfect for poolside service on cruise ships.',
        pairing: 'Light seafood, salads, fresh fruits',
        servingTemp: '6-8°C',
        cruiseShipTip: 'Ideal for outdoor dining and deck parties',
      };
    } else if (temp >= 20) {
      recommendations = {
        description: 'Great for medium-bodied wines',
        recommendations: ['Chardonnay', 'Pinot Noir', 'Merlot', 'Viognier', 'Grenache', 'Tempranillo', 'Sangiovese', 'Rosé'],
        tips: 'Room temperature for reds, slightly chilled for whites. Perfect for dinner service.',
        pairing: 'Grilled meats, pasta, Mediterranean cuisine',
        servingTemp: '12-16°C',
        cruiseShipTip: 'Excellent for formal dining and wine tastings',
      };
    } else if (temp >= 10) {
      recommendations = {
        description: 'Ideal for bold, warming wines',
        recommendations: ['Cabernet Sauvignon', 'Shiraz', 'Malbec', 'Zinfandel', 'Barolo', 'Bordeaux', 'Port', 'Madeira'],
        tips: 'Serve at room temperature, consider decanting. Perfect for evening events.',
        pairing: 'Rich meats, stews, aged cheeses',
        servingTemp: '16-18°C',
        cruiseShipTip: 'Great for special events and captain’s dinners',
      };
    } else {
      recommendations = {
        description: 'Perfect for rich, full-bodied wines',
        recommendations: ['Barolo', 'Bordeaux', 'Port', 'Madeira', 'Amarone', 'Brunello', 'Nebbiolo', 'Aged Cabernet'],
        tips: 'Serve at room temperature, consider warming slightly. Premium wine service.',
        pairing: 'Heavy dishes, chocolate desserts, aged cheeses',
        servingTemp: '18-20°C',
        cruiseShipTip: 'Premium wine service for luxury experiences',
      };
    }

    if (condition.includes('rain') || condition.includes('storm')) {
      recommendations.tips += ' Consider indoor wine tastings and cozy atmosphere.';
      recommendations.cruiseShipTip += ' Perfect for indoor wine events and tastings.';
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      recommendations.tips += ' Outdoor wine service recommended.';
      recommendations.cruiseShipTip += ' Ideal for deck wine service and outdoor events.';
    }

    return recommendations;
  }

  // Get cruise ship weather alerts
  getCruiseShipAlerts(weather: WeatherData): string[] {
    const alerts: string[] = [];
    const temp = weather.temperature;
    const windSpeed = weather.windSpeed;
    const humidity = weather.humidity;

    if (temp >= 35) {
      alerts.push('🌡️ High temperature alert: Consider chilled wine service and outdoor shade.');
    }
    if (temp <= 5) {
      alerts.push('❄️ Low temperature alert: Premium wine service recommended.');
    }
    if (windSpeed > 20) {
      alerts.push('💨 High winds: Secure outdoor wine service, consider indoor alternatives.');
    }
    if (humidity > 80) {
      alerts.push('💧 High humidity: Monitor wine storage conditions.');
    }
    if (weather.condition.includes('rain') || weather.condition.includes('storm')) {
      alerts.push('🌧️ Weather alert: Move wine tastings indoors, adjust outdoor service.');
    }

    return alerts;
  }

  // Get popular cruise destinations
  getCruiseDestinations(): string[] {
    return CRUISE_LOCATIONS;
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
      city: location.split(',')[0].trim(),
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

  // Clear caches
  clearCache() {
    weatherCache.clear();
    forecastCache.clear();
    console.log('🌤️ Weather and forecast caches cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      weatherCacheSize: weatherCache.size,
      forecastCacheSize: forecastCache.size,
      locations: Array.from(weatherCache.keys()),
    };
  }
}

// Export singleton instance
export const weatherService = WeatherService.getInstance();