import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  WineBar as WineBarIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Wine } from '@/types';

interface AIInsightsProps {
  wines: Wine[];
  analytics: any; // Replace with WineAnalytics once confirmed
}

interface Insight {
  type: 'pattern' | 'recommendation' | 'discovery' | 'trend';
  title: string;
  description: string;
  confidence: number;
  icon: React.ReactNode;
  color: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ wines, analytics }) => {
  const theme = useTheme();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userPreferences = useMemo(() => {
    const validPrices = wines
      .filter((w) => w.price !== undefined && !isNaN(w.price))
      .map((w) => w.price as number);

    return {
      regions: [...new Set(wines.map((w) => w.region))].filter(Boolean),
      grapes: [...new Set(wines.map((w) => w.grape))].filter(Boolean),
      averageRating:
        wines.length > 0
          ? wines.reduce((sum, w) => sum + w.rating, 0) / wines.length
          : 0,
      priceRange: {
        min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
        max: validPrices.length > 0 ? Math.max(...validPrices) : 0,
      },
      totalWines: wines.length,
      favoriteRegions: analytics?.favoriteRegions || [],
      favoriteGrapes: analytics?.favoriteGrapes || [],
    };
  }, [wines, analytics]);

  useEffect(() => {
    if (wines.length > 0 && analytics) {
      generateInsights();
    }
  }, [userPreferences]);

  const generateInsights = async () => {
    if (wines.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const aiInsights = await generateAIInsights(userPreferences);
      setInsights(aiInsights);
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
      console.error('AI Insights Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (preferences: any): Promise<Insight[]> => {
    const mockInsights: Insight[] = [];

    if (preferences.averageRating > 4.0) {
      mockInsights.push({
        type: 'pattern',
        title: 'High Standards',
        description: `You consistently rate wines highly (${preferences.averageRating.toFixed(1)}/5 average), indicating refined taste preferences.`,
        confidence: 0.9,
        icon: <StarIcon />,
        color: theme.palette.warning.main,
      });
    }

    if (preferences.regions.length < 5) {
      mockInsights.push({
        type: 'discovery',
        title: 'Regional Explorer',
        description: `You've tasted wines from ${preferences.regions.length} regions. Consider exploring new wine regions to expand your palate.`,
        confidence: 0.8,
        icon: <WineBarIcon />,
        color: theme.palette.success.main,
      });
    }

    const avgPrice =
      preferences.priceRange.max > 0
        ? (preferences.priceRange.min + preferences.priceRange.max) / 2
        : 0;
    if (avgPrice > 50) {
      mockInsights.push({
        type: 'trend',
        title: 'Premium Preferences',
        description: `You tend to prefer premium wines ($${avgPrice.toFixed(0)} average). Consider exploring value wines in similar styles.`,
        confidence: 0.85,
        icon: <MoneyIcon />,
        color: theme.palette.secondary.main,
      });
    }

    if (preferences.totalWines > 20) {
      mockInsights.push({
        type: 'pattern',
        title: 'Dedicated Collector',
        description: `With ${preferences.totalWines} wines, you're building an impressive collection. Consider organizing by region or style.`,
        confidence: 0.9,
        icon: <TrendingUpIcon />,
        color: theme.palette.primary.main,
      });
    }

    if (preferences.grapes.length < 8) {
      mockInsights.push({
        type: 'recommendation',
        title: 'Grape Variety Explorer',
        description: `You've tried ${preferences.grapes.length} grape varieties. Explore lesser-known grapes for new experiences.`,
        confidence: 0.75,
        icon: <LightbulbIcon />,
        color: theme.palette.info.main,
      });
    }

    const currentMonth = new Date().getMonth();
    const seasonalWines = wines.filter((w) => {
      const wineDate = new Date(w.timestamp);
      return wineDate.getMonth() === currentMonth;
    });

    if (seasonalWines.length > 0) {
      mockInsights.push({
        type: 'trend',
        title: 'Seasonal Tasting',
        description: `You've tasted ${seasonalWines.length} wines this month. Consider seasonal wine and food pairings.`,
        confidence: 0.7,
        icon: <AIIcon />,
        color: theme.palette.success.main,
      });
    }

    return mockInsights;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern':
        return 'primary';
      case 'recommendation':
        return 'secondary';
      case 'discovery':
        return 'success';
      case 'trend':
        return 'info';
      default:
        return 'default';
    }
  };

  if (wines.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <AIIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI Insights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add more wines to your collection to receive intelligent insights
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              AI Insights
            </Typography>
          </Box>
          <Button
            startIcon={<AIIcon />}
            onClick={generateInsights}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Analyzing your collection...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Intelligent analysis of your {wines.length} wines and tasting patterns
            </Typography>

            {insights.length > 0 ? (
              <List>
                {insights.map((insight, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box
                          sx={{
                            color: insight.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: `${insight.color}15`,
                          }}
                        >
                          {insight.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {insight.title}
                            </Typography>
                            <Chip
                              label={insight.type}
                              color={getInsightColor(insight.type)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {insight.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Confidence:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: i < Math.round(insight.confidence * 5)
                                        ? insight.color
                                        : theme.palette.grey[300],
                                    }}
                                  />
                                ))}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(insight.confidence * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < insights.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LightbulbIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Add more wines to receive personalized insights
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>How it works:</strong> Our AI analyzes your wine collection, ratings, and tasting patterns to provide personalized insights about your preferences, trends, and opportunities for exploration.
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;