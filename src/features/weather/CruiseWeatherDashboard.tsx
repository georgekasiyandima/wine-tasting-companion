import React, { useState, useEffect, useCallback, memo } from 'react';
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
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  Thermostat as TempIcon,
  LocationOn as LocationIcon,
  WineBar as WineIcon,
  Refresh as RefreshIcon,
  Notifications as AlertIcon,
  Schedule as ScheduleIcon,
  LocalShipping as CruiseIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { weatherService, WeatherData, WeatherWineRecommendation, ForecastData } from '@/api/weather';
import { useApp } from '@/context/AppContext';
import AnimatedCard from '@/components/common/AnimatedCard';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface CruiseDestination {
  name: string;
  country: string;
  weather: WeatherData | null;
  recommendations: WeatherWineRecommendation | null;
  alerts: string[];
  forecast: ForecastData[];
  lastUpdated: Date | null;
}

interface DestinationCardProps {
  destination: CruiseDestination;
  getWeatherIcon: (condition: string) => JSX.Element;
  getPriorityColor: (alerts: string[]) => string;
  onSelect: (destination: CruiseDestination) => void;
}

const DestinationCard = memo(({ destination, getWeatherIcon, getPriorityColor, onSelect }: DestinationCardProps) => (
  <Grid item xs={12} sm={6} md={4}>
    <AnimatedCard>
      <Card>
        <CardContent>
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
                onClick={() => onSelect(destination)}
                aria-label={`View details for ${destination.name}`}
              >
                <TimelineIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {destination.weather ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>{getWeatherIcon(destination.weather.condition)}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }} aria-label={`Temperature: ${destination.weather.temperature} degrees Celsius`}>
                    {destination.weather.temperature}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {destination.weather.description}
                  </Typography>
                </Box>
              </Box>
              {destination.alerts.length > 0 && (
                <Alert severity={getPriorityColor(destination.alerts) as any} sx={{ mb: 2 }} icon={<AlertIcon />} aria-label={`Alert: ${destination.alerts[0]}`}>
                  <Typography variant="body2">{destination.alerts[0]}</Typography>
                </Alert>
              )}
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
                    aria-label={`Wine recommendation: ${destination.recommendations.description}`}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {destination.recommendations.cruiseShipTip}
                  </Typography>
                </Box>
              )}
              {destination.lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Updated: {destination.lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </>
          ) : (
            <Alert severity="error" aria-live="assertive">
              Weather data unavailable
            </Alert>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  </Grid>
));

export default function CruiseWeatherDashboard() {
  const theme = useTheme();
  const { addNotification } = useApp();
  const [destinations, setDestinations] = useState<CruiseDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<CruiseDestination | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const initializeDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const cruiseLocations = weatherService.getCruiseDestinations();
      const destinationPromises = cruiseLocations.map(async (location) => {
        try {
          const [weather, forecast] = await Promise.all([
            weatherService.getCurrentWeather(location),
            weatherService.getForecast(location),
          ]);
          const recommendations = weatherService.getWineRecommendations(weather);
          const alerts = weatherService.getCruiseShipAlerts(weather);
          return {
            name: location.split(',')[0].trim(),
            country: location.split(',')[1]?.trim() || '',
            weather,
            recommendations,
            alerts,
            forecast,
            lastUpdated: new Date(),
          };
        } catch (error: any) {
          console.error(`Failed to load weather for ${location}:`, error);
          addNotification({
            type: 'error',
            message: error.message.includes('401') ? `Invalid API key for ${location}` : `Failed to load weather for ${location}`,
          });
          return {
            name: location.split(',')[0].trim(),
            country: location.split(',')[1]?.trim() || '',
            weather: null,
            recommendations: null,
            alerts: [],
            forecast: [],
            lastUpdated: null,
          };
        }
      });

      const results = await Promise.all(destinationPromises);
      setDestinations(results);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to initialize destinations' });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    initializeDestinations();
    const cleanup = weatherService.startRealTimeUpdates();
    return () => cleanup();
  }, [initializeDestinations]);

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

  const getPriorityColor = (alerts: string[]) => {
    if (alerts.some((alert) => alert.includes('High temperature') || alert.includes('High winds'))) {
      return 'error';
    }
    if (alerts.length > 0) {
      return 'warning';
    }
    return 'success';
  };

  const getFilteredDestinations = () => {
    switch (activeTab) {
      case 0:
        return destinations;
      case 1:
        return destinations.filter((dest) =>
          ['Stellenbosch', 'Franschhoek', 'Bordeaux', 'Tuscany'].some((region) => dest.name.includes(region))
        );
      case 2:
        return destinations.filter((dest) =>
          ['Spain', 'France', 'Italy', 'Greece'].some((country) => dest.country.includes(country))
        );
      case 3:
        return destinations.filter((dest) =>
          ['USA', 'Barbados', 'Jamaica'].some((country) => dest.country.includes(country) || dest.name.includes(country))
        );
      default:
        return destinations;
    }
  };

  const temperatureChartData = {
    labels: destinations.map((dest) => dest.name),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: destinations.map((dest) => dest.weather?.temperature || 0),
        backgroundColor: '#40C4B6',
        borderColor: '#00897B',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Temperature (°C)' } },
      x: { title: { display: true, text: 'Destination' } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Current Temperatures by Destination' },
    },
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }} aria-live="polite">
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
            aria-label="Refresh all destinations"
          >
            Refresh All
          </Button>
          <Chip
            label="Live Updates On"
            color="success"
            icon={<ScheduleIcon />}
            aria-label="Live updates enabled"
          />
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Bar data={temperatureChartData} options={chartOptions} aria-label="Bar chart of current temperatures by destination" />
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} aria-label="Destination filter tabs">
          <Tab label="All Destinations" aria-label="View all destinations" />
          <Tab label="Wine Regions" aria-label="View wine regions" />
          <Tab label="Mediterranean" aria-label="View Mediterranean destinations" />
          <Tab label="Caribbean" aria-label="View Caribbean destinations" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {getFilteredDestinations().map((destination, index) => (
          <DestinationCard
            key={index}
            destination={destination}
            getWeatherIcon={getWeatherIcon}
            getPriorityColor={getPriorityColor}
            onSelect={setSelectedDestination}
          />
        ))}
      </Grid>

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
                    <ListItemText primary="Temperature" secondary={`${selectedDestination.weather.temperature}°C`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RainIcon />
                    </ListItemIcon>
                    <ListItemText primary="Humidity" secondary={`${selectedDestination.weather.humidity}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RainIcon />
                    </ListItemIcon>
                    <ListItemText primary="Wind Speed" secondary={`${selectedDestination.weather.windSpeed} m/s`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimelineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Visibility" secondary={`${selectedDestination.weather.visibility} km`} />
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
                      aria-label={`Wine recommendation: ${selectedDestination.recommendations.description}`}
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
                          aria-label={`Recommended wine: ${wine}`}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      💡 {selectedDestination.recommendations.tips}
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        <CruiseIcon sx={{ mr: 1, fontSize: 16 }} />
                        Cruise Ship Tip
                      </Typography>
                      <Typography variant="body2">
                        {selectedDestination.recommendations.cruiseShipTip}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  5-Day Forecast
                </Typography>
                <Grid container spacing={2}>
                  {selectedDestination.forecast.map((day, index) => (
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
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDestination(null)} aria-label="Close destination details">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}