// Weather Service for Wine Tasting Companion
// Integrates weather data with wine recommendations

import { WEATHER_CONFIG, WEATHER_WINE_PAIRINGS } from '@/constants';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold';
  city: string;
  country: string;
  timestamp: number;
}

export interface WeatherWineRecommendation {
  condition: string;
  description: string;
  recommendations: string[];
  tips: string;
  temperature: number;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = WEATHER_CONFIG.API_KEY;
    this.baseUrl = WEATHER_CONFIG.BASE_URL;
  }

  // Get current weather for a location
  async getCurrentWeather(city: string = WEATHER_CONFIG.DEFAULT_CITY): Promise<WeatherData> {
    try {
      // In demo mode, return mock data
      if (this.apiKey === 'demo_key') {
        return this.getMockWeatherData(city);
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      return this.parseWeatherData(data);
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getMockWeatherData(city);
    }
  }

  // Get wine recommendations based on weather
  getWineRecommendations(weather: WeatherData): WeatherWineRecommendation {
    const condition = this.determineWeatherCondition(weather);
    const pairing = WEATHER_WINE_PAIRINGS[condition];

    return {
      condition,
      description: pairing.description,
      recommendations: pairing.recommendations,
      tips: pairing.tips,
      temperature: weather.temperature
    };
  }

  // Determine weather condition for wine pairing
  private determineWeatherCondition(weather: WeatherData): 'sunny' | 'cloudy' | 'rainy' | 'hot' | 'cold' {
    const temp = weather.temperature;
    const description = weather.description.toLowerCase();

    if (temp >= 30) return 'hot';
    if (temp <= 10) return 'cold';
    if (description.includes('rain') || description.includes('drizzle')) return 'rainy';
    if (description.includes('cloud') || description.includes('overcast')) return 'cloudy';
    return 'sunny';
  }

  // Parse weather API response
  private parseWeatherData(data: any): WeatherData {
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: this.determineWeatherCondition({
        temperature: data.main.temp,
        description: data.weather[0].description
      } as WeatherData),
      city: data.name,
      country: data.sys.country,
      timestamp: Date.now()
    };
  }

  // Mock weather data for demo mode
  private getMockWeatherData(city: string): WeatherData {
    const mockConditions = [
      { temp: 25, desc: 'sunny', icon: '01d', condition: 'sunny' as const },
      { temp: 18, desc: 'cloudy', icon: '03d', condition: 'cloudy' as const },
      { temp: 12, desc: 'rainy', icon: '10d', condition: 'rainy' as const },
      { temp: 32, desc: 'hot', icon: '01d', condition: 'hot' as const },
      { temp: 8, desc: 'cold', icon: '13d', condition: 'cold' as const }
    ];

    const randomCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
    
    return {
      temperature: randomCondition.temp,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      description: randomCondition.desc,
      icon: randomCondition.icon,
      condition: randomCondition.condition,
      city: city.split(',')[0],
      country: city.split(',')[1]?.trim() || 'South Africa',
      timestamp: Date.now()
    };
  }

  // Get weather forecast (for future enhancement)
  async getForecast(city: string = WEATHER_CONFIG.DEFAULT_CITY, days: number = 5) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getMockForecast(city, days);
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}`
      );

      if (!response.ok) {
        throw new Error('Weather forecast API request failed');
      }

      const data = await response.json();
      return this.parseForecastData(data);
    } catch (error) {
      console.error('Weather forecast error:', error);
      return this.getMockForecast(city, days);
    }
  }

  private getMockForecast(city: string, days: number) {
    const forecast = [];
    const baseTemp = 20;
    
    for (let i = 0; i < days; i++) {
      const temp = baseTemp + (Math.random() - 0.5) * 10;
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temperature: Math.round(temp),
        description: 'partly cloudy',
        icon: '02d'
      });
    }
    
    return forecast;
  }

  private parseForecastData(data: any) {
    // Implementation for real forecast parsing
    return data.list.map((item: any) => ({
      date: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));
  }
}

// Export weather service instance
export const weatherService = new WeatherService(); 