import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  WineBar as WineBarIcon,
  AttachMoney as MoneyIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Wine } from '@/types';
import { aiService, AIRecommendation } from '@/services/ai';

interface AIRecommendationsProps {
  userWines: Wine[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ userWines }) => {
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userWines.length > 0) {
      generateRecommendations();
    }
  }, [userWines]);

  const generateRecommendations = async () => {
    if (userWines.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const userPreferences = {
        regions: [...new Set(userWines.map(w => w.region))],
        grapes: [...new Set(userWines.map(w => w.grape))],
        averageRating: userWines.reduce((sum, w) => sum + w.rating, 0) / userWines.length,
        priceRange: {
          min: Math.min(...userWines.filter(w => w.price !== undefined).map(w => w.price!)),
          max: Math.max(...userWines.filter(w => w.price !== undefined).map(w => w.price!)),
        }
      };

      const recs = await aiService.getPersonalizedRecommendations(userWines, userPreferences);
      setRecommendations(recs);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error('AI Recommendations Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'similar': return 'primary';
      case 'upgrade': return 'secondary';
      case 'discovery': return 'success';
      case 'value': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryThemeColor = (category: string) => {
    switch (category) {
      case 'similar': return theme.palette.primary.main;
      case 'upgrade': return theme.palette.secondary.main;
      case 'discovery': return theme.palette.success.main;
      case 'value': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'similar': return <WineBarIcon />;
      case 'upgrade': return <TrendingUpIcon />;
      case 'discovery': return <AIIcon />;
      case 'value': return <MoneyIcon />;
      default: return <LightbulbIcon />;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'similar': return 'Similar to wines you love';
      case 'upgrade': return 'Premium options to explore';
      case 'discovery': return 'New experiences to try';
      case 'value': return 'Great value for money';
      default: return 'Recommended for you';
    }
  };

  if (userWines.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <AIIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start adding wines to your collection to receive personalized recommendations
            </Typography>
            <Button variant="contained" color="primary">
              Add Your First Wine
            </Button>
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
              AI Recommendations
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={generateRecommendations}
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
              Based on your {userWines.length} wines and preferences
            </Typography>

            <Stack spacing={2}>
              {recommendations.map((rec, index) => (
                <Paper key={index} sx={{ p: 2, borderColor: getCategoryThemeColor(rec.category), '&:hover': { boxShadow: 2, transform: 'translateY(-2px)', transition: 'all 0.2s ease-in-out' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <IconButton
                      sx={{
                        bgcolor: getCategoryThemeColor(rec.category),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getCategoryIcon(rec.category)}
                    </IconButton>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {rec.wineName}
                        </Typography>
                        <Chip
                          label={rec.category}
                          color={getCategoryColor(rec.category)}
                          size="small"
                          icon={getCategoryIcon(rec.category)}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {getCategoryDescription(rec.category)}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {rec.reason}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Match confidence:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {[...Array(5)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: i < Math.round(rec.confidence * 5) 
                                  ? getCategoryThemeColor(rec.category)
                                  : theme.palette.grey[300],
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(rec.confidence * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>How it works:</strong> Our AI analyzes your wine collection, ratings, and preferences to suggest wines you might enjoy. Recommendations are categorized by similarity, upgrades, discoveries, and value picks.
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations; 