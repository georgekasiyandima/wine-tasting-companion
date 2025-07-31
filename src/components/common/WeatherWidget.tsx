import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  Thermostat as TempIcon,
  LocationOn as LocationIcon,
  WineBar as WineIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Notifications as AlertIcon,
  Schedule as ScheduleIcon,
  LocalShipping as CruiseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { weatherService, WeatherData, WeatherWineRecommendation, ForecastData } from '@/api/weather';
import { useApp } from '@/context/AppContext';
import AnimatedCard from './AnimatedCard';

interface WeatherWidgetProps {
  compact?: boolean;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  recommendations: WeatherWineRecommendation | null;
  cruiseAlerts: string[];
  getWeatherIcon: (condition: string) => JSX.Element;
  getConditionColor: (condition: string) => string;
}

const WeatherDisplay = memo(({ weather, recommendations, cruiseAlerts, getWeatherIcon, getConditionColor }: WeatherDisplayProps) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Box sx={{ mr: 3 }}>{getWeatherIcon(weather.condition)}</Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }} aria-label={`Temperature: ${weather.temperature} degrees Celsius`}>
          {weather.temperature}°C
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {weather.description} • {weather.humidity}% humidity
        </Typography>
      </Box>
    </Box>
    {cruiseAlerts.length > 0 && (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <AlertIcon sx={{ mr: 1, color: 'warning.main' }} />
          Cruise Ship Alerts
        </Typography>
        {cruiseAlerts.map((alert, index) => (
          <Alert key={index} severity="warning" sx={{ mb: 1 }} aria-label={`Cruise alert: ${alert}`}>
            <Typography variant="body2">{alert}</Typography>
          </Alert>
        ))}
      </Box>
    )}
    {recommendations && (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          <WineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Perfect for Today
        </Typography>
        <Chip
          label={recommendations.description}
          color="primary"
          sx={{ mb: 2 }}
          aria-label={`Wine recommendation: ${recommendations.description}`}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Recommended Wines:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {recommendations.recommendations.slice(0, 4).map((wine) => (
            <Chip
              key={wine}
              label={wine}
              size="small"
              variant="outlined"
              color="secondary"
              aria-label={`Recommended wine: ${wine}`}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          💡 {recommendations.tips}
        </Typography>
        {recommendations.cruiseShipTip && (
          <Box sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              <CruiseIcon sx={{ mr: 1, color: 'info.main' }} />
              Cruise Ship Tip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {recommendations.cruiseShipTip}
            </Typography>
          </Box>
        )}
      </Box>
    )}
  </Box>
));

export default function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const theme = useTheme();
  const { addNotification } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [recommendations, setRecommendations] = useState<WeatherWineRecommendation | null>(null);
  const [cruiseAlerts, setCruiseAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDialog, setLocationDialog] = useState(false);
  const [forecastDialog, setForecastDialog] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const loadWeather = useCallback(async (location?: string) => {
    try {
      setLoading(true);
      setError(null);
      const targetLocation = location || 'Cape Town, South Africa';
      const [weatherData, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(targetLocation),
        weatherService.getForecast(targetLocation),
      ]);
      const wineRecs = weatherService.getWineRecommendations(weatherData);
      const alerts = weatherService.getCruiseShipAlerts(weatherData);
      setWeather(weatherData);
      setForecast(forecastData);
      setRecommendations(wineRecs);
      setCruiseAlerts(alerts);
    } catch (err: any) {
      setError(err.message || 'Failed to load weather data');
      addNotification({
        type: 'error',
        message: err.message.includes('401') ? 'Invalid Weather API key' : 'Weather service unavailable',
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadWeather();
    const unsubscribe = weatherService.subscribe((weatherData) => {
      setWeather(weatherData);
      setRecommendations(weatherService.getWineRecommendations(weatherData));
      setCruiseAlerts(weatherService.getCruiseShipAlerts(weatherData));
    });

    const cleanup = weatherService.startRealTimeUpdates('Cape Town, South Africa', 300000);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [loadWeather]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <SunnyIcon sx={{ color: '#FFD700' }} aria-hidden="true" />;
      case 'cloudy':
        return <CloudIcon sx={{ color: '#87CEEB' }} aria-hidden="true" />;
      case 'rainy':
        return <RainIcon sx={{ color: '#4682B4' }} aria-hidden="true" />;
      case 'hot':
        return <SunnyIcon sx={{ color: '#FF4500' }} aria-hidden="true" />;
      case 'cold':
        return <CloudIcon sx={{ color: '#B0C4DE' }} aria-hidden="true" />;
      case 'stormy':
        return <RainIcon sx={{ color: '#2F4F4F' }} aria-hidden="true" />;
      default:
        return <SunnyIcon aria-hidden="true" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return theme.palette.warning.main;
      case 'cloudy':
        return theme.palette.info.main;
      case 'rainy':
        return theme.palette.primary.main;
      case 'hot':
        return theme.palette.error.main;
      case 'cold':
        return theme.palette.secondary.main;
      case 'stormy':
        return theme.palette.grey[700];
      default:
        return theme.palette.primary.main;
    }
  };

  if (loading) {
    return (
      <AnimatedCard>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }} aria-live="polite">
              Loading weather data...
            </Typography>
          </CardContent>
        </Card>
      </AnimatedCard>
    );
  }

  if (error || !weather) {
    return (
      <AnimatedCard>
        <Card>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }} aria-live="assertive">
              {error || 'Weather data unavailable'}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadWeather()}
              fullWidth
              aria-label="Retry loading weather data"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </AnimatedCard>
    );
  }

  if (compact) {
    return (
      <AnimatedCard>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getWeatherIcon(weather.condition)}
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }} aria-label={`Temperature: ${weather.temperature} degrees Celsius`}>
                  {weather.temperature}°C
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => setLocationDialog(true)}
                aria-label={`Change location from ${weather.city}`}
              >
                {weather.city}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {weather.description}
            </Typography>
            <Chip
              label={recommendations?.description}
              size="small"
              color="primary"
              variant="outlined"
              aria-label={`Wine recommendation: ${recommendations?.description}`}
            />
          </CardContent>
        </Card>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <TempIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
                Weather & Wine
              </Typography>
              <Box>
                <Button
                  size="small"
                  startIcon={<LocationIcon />}
                  onClick={() => setLocationDialog(true)}
                  aria-label={`Change location from ${weather.city}, ${weather.country}`}
                  sx={{ mr: 1 }}
                >
                  {weather.city}, {weather.country}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setForecastDialog(true)}
                  aria-label="View 5-day forecast"
                >
                  Forecast
                </Button>
              </Box>
            </Box>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} aria-label="Weather view tabs">
              <Tab label="Current" aria-label="View current weather" />
              <Tab label="Forecast" aria-label="View 5-day forecast" />
            </Tabs>
            {activeTab === 0 && (
              <WeatherDisplay
                weather={weather}
                recommendations={recommendations}
                cruiseAlerts={cruiseAlerts}
                getWeatherIcon={getWeatherIcon}
                getConditionColor={getConditionColor}
              />
            )}
            {activeTab === 1 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  {forecast.map((day, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {getWeatherIcon(day.condition)}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {day.temperature}°C
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {day.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => loadWeather()}
                aria-label="Refresh weather data"
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setLocationDialog(true)}
                aria-label="Change location"
              >
                Change Location
              </Button>
              <Chip
                label="Live Updates On"
                color="success"
                size="small"
                icon={<ScheduleIcon />}
                aria-label="Live updates enabled"
              />
            </Box>
          </CardContent>
        </Card>
      </AnimatedCard>

      <Dialog open={locationDialog} onClose={() => setLocationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter a city name to get weather-based wine recommendations for that location.
          </Typography>
          <TextField
            fullWidth
            label="City, Country"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="e.g., Cape Town, South Africa"
            sx={{ mb: 2 }}
            aria-label="Enter city and country for weather data"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Popular wine regions: Stellenbosch, Franschhoek, Paarl, Napa Valley, Bordeaux, Tuscany
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            🚢 Popular Cruise Destinations:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {weatherService.getCruiseDestinations().slice(0, 8).map((destination) => (
              <Chip
                key={destination}
                label={destination}
                size="small"
                variant="outlined"
                onClick={() => setCustomLocation(destination)}
                sx={{ cursor: 'pointer' }}
                aria-label={`Select ${destination} as location`}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialog(false)} aria-label="Cancel location change">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (customLocation.trim()) {
                loadWeather(customLocation.trim());
                setLocationDialog(false);
                setCustomLocation('');
              }
            }}
            disabled={!customLocation.trim()}
            aria-label="Update location"
          >
            Update Location
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={forecastDialog} onClose={() => setForecastDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            5-Day Weather Forecast for {weather.city}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {forecast.length ? (
            <Grid container spacing={2}>
              {forecast.map((day, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {getWeatherIcon(day.condition)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {day.temperature}°C
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {day.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No forecast data available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)} aria-label="Close forecast dialog">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}