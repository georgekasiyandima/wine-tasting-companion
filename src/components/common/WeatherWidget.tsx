import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  CircularProgress,
  Alert,
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
import { weatherService, WeatherData, WeatherWineRecommendation } from '@/api/weather';
import { useApp } from '@/context/AppContext';
import AnimatedCard from './AnimatedCard';

interface WeatherWidgetProps {
  compact?: boolean;
}

export default function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const theme = useTheme();
  const { addNotification } = useApp();
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<WeatherWineRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDialog, setLocationDialog] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [cruiseAlerts, setCruiseAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadWeather();
    
    // Start real-time updates for cruise ship locations
    const unsubscribe = weatherService.subscribe((weather) => {
      setWeather(weather);
      const recs = weatherService.getWineRecommendations(weather);
      setRecommendations(recs);
      setCruiseAlerts(weatherService.getCruiseShipAlerts(weather));
    });

    // Start real-time updates every 5 minutes
    weatherService.startRealTimeUpdates(undefined, 300000); // 5 minutes
    setRealTimeEnabled(true);

    return () => {
      unsubscribe();
      weatherService.stopRealTimeUpdates();
    };
  }, []);

  const loadWeather = async (location?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const weatherData = await weatherService.getCurrentWeather(location);
      const wineRecs = weatherService.getWineRecommendations(weatherData);
      
      setWeather(weatherData);
      setRecommendations(wineRecs);
    } catch (err) {
      setError('Failed to load weather data');
      addNotification({
        type: 'error',
        message: 'Weather service unavailable',
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <SunnyIcon sx={{ color: '#FFD700' }} />;
      case 'cloudy':
        return <CloudIcon sx={{ color: '#87CEEB' }} />;
      case 'rainy':
        return <RainIcon sx={{ color: '#4682B4' }} />;
      case 'hot':
        return <SunnyIcon sx={{ color: '#FF4500' }} />;
      case 'cold':
        return <CloudIcon sx={{ color: '#B0C4DE' }} />;
      default:
        return <SunnyIcon />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
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
            <Typography variant="body2" sx={{ mt: 2 }}>
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'Weather data unavailable'}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadWeather()}
              fullWidth
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
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                  {weather.temperature}°C
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => setLocationDialog(true)}
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
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <TempIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Weather & Wine
              </Typography>
              <Button
                size="small"
                startIcon={<LocationIcon />}
                onClick={() => setLocationDialog(true)}
              >
                {weather.city}, {weather.country}
              </Button>
            </Box>

            {/* Current Weather */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ mr: 3 }}>
                {getWeatherIcon(weather.condition)}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {weather.temperature}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {weather.description} • {weather.humidity}% humidity
                </Typography>
              </Box>
            </Box>

            {/* Cruise Ship Alerts */}
            {cruiseAlerts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AlertIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Cruise Ship Alerts
                </Typography>
                {cruiseAlerts.map((alert, index) => (
                  <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {alert}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}

            {/* Wine Recommendations */}
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
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  💡 {recommendations.tips}
                </Typography>

                {/* Cruise Ship Specific Tips */}
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

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => loadWeather()}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setLocationDialog(true)}
              >
                Change Location
              </Button>
              <Chip
                label={realTimeEnabled ? 'Live Updates On' : 'Live Updates Off'}
                color={realTimeEnabled ? 'success' : 'default'}
                size="small"
                icon={<ScheduleIcon />}
              />
            </Box>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Location Dialog */}
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
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (customLocation.trim()) {
                loadWeather(customLocation.trim());
                setLocationDialog(false);
                setCustomLocation('');
              }
            }}
          >
            Update Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 