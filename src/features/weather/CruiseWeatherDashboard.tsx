import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { weatherService } from '@/api/weather';
import { useApp } from '@/context/AppContext';
import { WeatherData, WeatherWineRecommendation } from '@/types';
import AnimatedCard from '@/components/common/AnimatedCard';

interface CruiseDestination {
  name: string;
  country: string;
  weather: WeatherData | null;
  recommendations: WeatherWineRecommendation | null;
  alerts: string[];
  lastUpdated: Date | null;
}

export default function CruiseWeatherDashboard() {
  const theme = useTheme();
  const { addNotification } = useApp();
  
  const [destinations, setDestinations] = useState<CruiseDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<CruiseDestination | null>(null);
  const [forecastDialog, setForecastDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    initializeDestinations();
  }, []);

  const initializeDestinations = async () => {
    setLoading(true);
    
    const cruiseLocations = weatherService.getCruiseDestinations();
    const destinationPromises = cruiseLocations.map(async (location) => {
      try {
        const weather = await weatherService.getCurrentWeather(location);
        const recommendations = weatherService.getWineRecommendations(weather);
        const alerts = weatherService.getCruiseShipAlerts(weather);
        
        return {
          name: location.split(',')[0],
          country: location.split(',')[1]?.trim() || '',
          weather,
          recommendations,
          alerts,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error(`Failed to load weather for ${location}:`, error);
        return {
          name: location.split(',')[0],
          country: location.split(',')[1]?.trim() || '',
          weather: null,
          recommendations: null,
          alerts: [],
          lastUpdated: null,
        };
      }
    });

    const results = await Promise.all(destinationPromises);
    setDestinations(results);
    setLoading(false);

    // Start real-time updates
    if (realTimeEnabled) {
      startRealTimeUpdates();
    }
  };

  const startRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      const updatedDestinations = await Promise.all(
        destinations.map(async (dest) => {
          if (!dest.weather) return dest;
          
          try {
            const weather = await weatherService.getCurrentWeather(`${dest.name}, ${dest.country}`);
            const recommendations = weatherService.getWineRecommendations(weather);
            const alerts = weatherService.getCruiseShipAlerts(weather);
            
            return {
              ...dest,
              weather,
              recommendations,
              alerts,
              lastUpdated: new Date(),
            };
          } catch (error) {
            return dest;
          }
        })
      );
      
      setDestinations(updatedDestinations);
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
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
      case 'stormy':
        return <RainIcon sx={{ color: '#2F4F4F' }} />;
      default:
        return <SunnyIcon />;
    }
  };

  const getPriorityColor = (alerts: string[]) => {
    if (alerts.some(alert => alert.includes('High temperature') || alert.includes('High winds'))) {
      return 'error';
    }
    if (alerts.length > 0) {
      return 'warning';
    }
    return 'success';
  };

  const getFilteredDestinations = () => {
    switch (activeTab) {
      case 0: // All destinations
        return destinations;
      case 1: // Wine regions
        return destinations.filter(dest => 
          dest.name.includes('Stellenbosch') || 
          dest.name.includes('Franschhoek') || 
          dest.name.includes('Bordeaux') || 
          dest.name.includes('Tuscany')
        );
      case 2: // Mediterranean
        return destinations.filter(dest => 
          dest.country.includes('Spain') || 
          dest.country.includes('France') || 
          dest.country.includes('Italy') || 
          dest.country.includes('Greece')
        );
      case 3: // Caribbean
        return destinations.filter(dest => 
          dest.country.includes('USA') || 
          dest.name.includes('Barbados') || 
          dest.name.includes('Jamaica')
        );
      default:
        return destinations;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading cruise weather data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🚢 Cruise Weather Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={initializeDestinations}
            sx={{ mr: 1 }}
          >
            Refresh All
          </Button>
          <Chip
            label={realTimeEnabled ? 'Live Updates On' : 'Live Updates Off'}
            color={realTimeEnabled ? 'success' : 'default'}
            icon={<ScheduleIcon />}
          />
        </Box>
      </Box>

      {/* Destination Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="All Destinations" />
          <Tab label="Wine Regions" />
          <Tab label="Mediterranean" />
          <Tab label="Caribbean" />
        </Tabs>
      </Box>

      {/* Weather Grid */}
      <Grid container spacing={3}>
        {getFilteredDestinations().map((destination, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <AnimatedCard>
              <Card>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {destination.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {destination.country}
                      </Typography>
                    </Box>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedDestination(destination)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {destination.weather ? (
                    <>
                      {/* Current Weather */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ mr: 2 }}>
                          {getWeatherIcon(destination.weather.condition)}
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {destination.weather.temperature}°C
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {destination.weather.description}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Alerts */}
                      {destination.alerts.length > 0 && (
                        <Alert 
                          severity={getPriorityColor(destination.alerts) as any}
                          sx={{ mb: 2 }}
                          icon={<AlertIcon />}
                        >
                          <Typography variant="body2">
                            {destination.alerts[0]}
                          </Typography>
                        </Alert>
                      )}

                      {/* Wine Recommendations */}
                      {destination.recommendations && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            <WineIcon sx={{ mr: 1, fontSize: 16 }} />
                            Wine Pairing
                          </Typography>
                          <Chip
                            label={destination.recommendations.description}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {destination.recommendations.cruiseShipTip}
                          </Typography>
                        </Box>
                      )}

                      {/* Last Updated */}
                      {destination.lastUpdated && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                          Updated: {destination.lastUpdated.toLocaleTimeString()}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Alert severity="error">
                      Weather data unavailable
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      {/* Destination Details Dialog */}
      <Dialog open={!!selectedDestination} onClose={() => setSelectedDestination(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {selectedDestination?.name}, {selectedDestination?.country}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedDestination?.weather && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Current Weather
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TempIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Temperature"
                      secondary={`${selectedDestination.weather.temperature}°C`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RainIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Humidity"
                      secondary={`${selectedDestination.weather.humidity}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Wind Speed"
                      secondary={`${selectedDestination.weather.windSpeed} m/s`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ViewIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Visibility"
                      secondary={`${selectedDestination.weather.visibility} km`}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Wine Recommendations
                </Typography>
                {selectedDestination.recommendations && (
                  <Box>
                    <Chip
                      label={selectedDestination.recommendations.description}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Recommended Wines:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {selectedDestination.recommendations.recommendations.map((wine) => (
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
                      💡 {selectedDestination.recommendations.tips}
                    </Typography>
                    
                    <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        <CruiseIcon sx={{ mr: 1, fontSize: 16 }} />
                        Cruise Ship Tip
                      </Typography>
                      <Typography variant="body2">
                        {selectedDestination.recommendations.cruiseShipTip}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDestination(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setForecastDialog(true);
              setSelectedDestination(null);
            }}
          >
            View Forecast
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forecast Dialog */}
      <Dialog open={forecastDialog} onClose={() => setForecastDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            5-Day Weather Forecast
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Weather forecast data will be displayed here for cruise planning.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 