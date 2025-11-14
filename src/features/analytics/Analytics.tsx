import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  WineBar as WineIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Palette as PaletteIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { useApp } from '@/context/AppContext';
import { Wine, WineAnalytics } from '@/types';
import { WineService } from '@/api/firebase';
import { RATING_LABELS } from '@/constants';// Update to '@/constants' if needed

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const COLORS = [
  '#8B0000',
  '#D4AF37',
  '#2E8B57',
  '#4682B4',
  '#9370DB',
  '#FF6347',
  '#20B2AA',
  '#FFD700',
  '#FF69B4',
  '#32CD32',
];

export default function Analytics() {
  const theme = useTheme();
  const { state, addNotification } = useApp();
  const [analytics, setAnalytics] = useState<WineAnalytics | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, state.user?.id, addNotification]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      if (!state.user?.id) {
        addNotification({
          type: 'error',
          message: 'No user ID found. Please log in.',
        });
        return;
      }
      const wineList = await WineService.getWines(state.user.id);
      setWines(wineList);

      if (wineList.length > 0) {
        const filteredWines = filterWinesByTimeRange(wineList, timeRange);
        const analyticsData = calculateAnalytics(filteredWines);
        setAnalytics(analyticsData);
      } else {
        addNotification({
          type: 'info',
          message: 'No wines found. Add wines to see analytics.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Failed to load analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWinesByTimeRange = (wineList: Wine[], range: string): Wine[] => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (range) {
      case 'month':
        return wineList.filter((wine) => {
          const wineDate = new Date(wine.timestamp);
          if (isNaN(wineDate.getTime())) return false;
          const monthStart = new Date(currentYear, currentMonth, 1);
          const monthEnd = new Date(currentYear, currentMonth + 1, 0);
          return wineDate >= monthStart && wineDate <= monthEnd;
        });
      case 'quarter':
        return wineList.filter((wine) => {
          const wineDate = new Date(wine.timestamp);
          if (isNaN(wineDate.getTime())) return false;
          const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
          return wineDate >= quarterStart;
        });
      case 'year':
        return wineList.filter((wine) => {
          const wineDate = new Date(wine.timestamp);
          return !isNaN(wineDate.getTime()) && wineDate.getFullYear() === currentYear;
        });
      default:
        return wineList;
    }
  };

  const calculateAnalytics = (wineList: Wine[]): WineAnalytics => {
    const totalWines = wineList.length;
    
    // Calculate average rating
    const averageRating = totalWines > 0
      ? wineList.reduce((sum, wine) => sum + wine.rating, 0) / totalWines
      : 0;

    // Initialize stats objects
    const regionStats: { [key: string]: { count: number; totalRating: number } } = {};
    const grapeStats: { [key: string]: { count: number; totalRating: number } } = {};
    const monthlyStats: { [key: string]: { count: number; totalRating: number } } = {};
    const ratingDistribution: { [key: string]: number } = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    // Process each wine
    wineList.forEach((wine) => {
      // Region stats
      if (wine.region) {
        if (!regionStats[wine.region]) {
          regionStats[wine.region] = { count: 0, totalRating: 0 };
        }
        regionStats[wine.region].count++;
        regionStats[wine.region].totalRating += wine.rating;
      }

      // Grape stats
      if (wine.grape) {
        if (!grapeStats[wine.grape]) {
          grapeStats[wine.grape] = { count: 0, totalRating: 0 };
        }
        grapeStats[wine.grape].count++;
        grapeStats[wine.grape].totalRating += wine.rating;
      }

      // Rating distribution
      const ratingKey = Math.round(wine.rating).toString() as keyof typeof ratingDistribution;
      if (ratingDistribution[ratingKey] !== undefined) {
        ratingDistribution[ratingKey]++;
      }

      // Monthly stats
      if (wine.timestamp) {
        const date = new Date(wine.timestamp);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { count: 0, totalRating: 0 };
          }
          monthlyStats[monthKey].count++;
          monthlyStats[monthKey].totalRating += wine.rating;
        }
      }
    });

    // Calculate favorite regions
    const favoriteRegions = Object.entries(regionStats)
      .map(([region, stats]) => ({
        region,
        count: stats.count,
        averageRating: stats.totalRating / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate favorite grapes
    const favoriteGrapes = Object.entries(grapeStats)
      .map(([grape, stats]) => ({
        grape,
        count: stats.count,
        averageRating: stats.totalRating / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate monthly tastings
    const monthlyTastings = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        count: stats.count,
        averageRating: stats.totalRating / stats.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    return {
      totalWines,
      averageRating,
      favoriteRegions,
      favoriteGrapes,
      ratingDistribution,
      monthlyTastings,
    };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: { value: number; positive: boolean };
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon
              sx={{
                color: trend.positive ? 'success.main' : 'error.main',
                transform: trend.positive ? 'none' : 'rotate(180deg)',
              }}
            />
            <Typography
              variant="caption"
              color={trend.positive ? 'success.main' : 'error.main'}
            >
              {trend.value}% from last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderOverview = () => {
    if (!analytics) return null;

    const chartData = Object.entries(analytics.ratingDistribution || {}).map(([rating, count]) => ({
      rating: RATING_LABELS[rating as keyof typeof RATING_LABELS] || rating,
      count: Number(count),
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Wines"
            value={analytics.totalWines || 0}
            icon={<WineIcon />}
            color={theme.palette.primary.main}
            subtitle="in collection"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Average Rating"
            value={analytics.averageRating ? analytics.averageRating.toFixed(1) : '0.0'}
            icon={<StarIcon />}
            color={theme.palette.secondary.main}
            subtitle="out of 5 stars"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Top Region"
            value={analytics.favoriteRegions[0]?.region || 'None'}
            icon={<LocationIcon />}
            color={theme.palette.success.main}
            subtitle="most tasted"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Top Grape"
            value={analytics.favoriteGrapes[0]?.grape || 'None'}
            icon={<PaletteIcon />}
            color={theme.palette.info.main}
            subtitle="most tasted"
          />
        </Grid>

        {/* Rating Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Rating Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Monthly Tastings
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyTastings || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.secondary.main}
                    fill={`${theme.palette.secondary.main}20`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12}>
          <AIInsights wines={wines} analytics={analytics} />
        </Grid>
      </Grid>
    );
  };

  const renderRegions = () => {
    if (!analytics) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Wine Regions
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.favoriteRegions || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={theme.palette.primary.main} name="Wines Tasted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Region Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.favoriteRegions.slice(0, 8) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.favoriteRegions.slice(0, 8) || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderGrapes = () => {
    if (!analytics) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Grape Varieties
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.favoriteGrapes || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grape" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={theme.palette.secondary.main} name="Wines Tasted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Grape Variety Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.favoriteGrapes.slice(0, 8) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grape, percent }) => `${grape} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.favoriteGrapes.slice(0, 8) || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderTrends = () => {
    if (!analytics) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tasting Trends Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyTastings || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    name="Wines Tasted"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="averageRating"
                    stroke={theme.palette.secondary.main}
                    name="Average Rating"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics || analytics.totalWines === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <WineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2 }}>
          No Analytics Data Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start adding wines to your collection to see detailed analytics and insights.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Analytics & Insights
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Regions" icon={<LocationIcon />} iconPosition="start" />
          <Tab label="Grapes" icon={<PaletteIcon />} iconPosition="start" />
          <Tab label="Trends" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderOverview()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderRegions()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderGrapes()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderTrends()}
      </TabPanel>
    </Box>
  );
}