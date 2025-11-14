import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  WineBar as WineIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useApp } from '@/context/AppContext';
import { Wine, WineAnalytics } from '@/types';
import { WineService } from '@/api/firebase';
import { PROFILE_IMAGES } from '@/constants';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface ProfileForm {
  displayName: string;
  email: string;
}

export default function Profile() {
  const theme = useTheme();
  const { state, addNotification, toggleTheme } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wines, setWines] = useState<Wine[]>([]);
  const [analytics, setAnalytics] = useState<WineAnalytics | null>(null);

  const form = useForm<ProfileForm>({
    defaultValues: {
      displayName: state.user?.displayName || '',
      email: state.user?.email || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const wineList = await WineService.getWines(state.user?.id);
      setWines(wineList);
      
      // Calculate analytics
      const totalWines = wineList.length;
      const averageRating = wineList.length > 0 
        ? wineList.reduce((sum, wine) => sum + wine.rating, 0) / wineList.length 
        : 0;
      
      const regions = wineList.reduce((acc, wine) => {
        acc[wine.region] = (acc[wine.region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteRegions = Object.entries(regions)
        .map(([region, count]) => ({ 
          region, 
          count,
          averageRating: wineList
            .filter(w => w.region === region)
            .reduce((sum, wine) => sum + wine.rating, 0) / count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate rating distribution
      const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      wineList.forEach(wine => {
        const rating = Math.floor(wine.rating).toString() as keyof typeof ratingDistribution;
        ratingDistribution[rating]++;
      });

      setAnalytics({
        totalWines,
        averageRating,
        favoriteRegions,
        favoriteGrapes: [],
        ratingDistribution,
        monthlyTastings: [],
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load user data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.reset({
      displayName: state.user?.displayName || '',
      email: state.user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleSave = async (_data: ProfileForm) => {
    try {
      setLoading(true);
      // TODO: Implement profile update in Firebase service
      addNotification({
        type: 'success',
        message: 'Profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = () => {
    return wines
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(wine => ({
        id: wine.id,
        type: 'wine_added',
        title: `Added ${wine.name}`,
        subtitle: `${wine.grape} • ${wine.region} • ${wine.vintage}`,
        rating: wine.rating,
        timestamp: wine.timestamp,
        icon: <WineIcon />,
      }));
  };

  const getTopWines = () => {
    return wines
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                src={PROFILE_IMAGES.DEFAULT_AVATAR}
                alt={state.user?.displayName || 'User'}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '3rem',
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {state.user?.displayName?.charAt(0) || state.user?.email?.charAt(0) || PROFILE_IMAGES.FALLBACK_INITIALS}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {state.user?.displayName || state.user?.email || 'Unknown User'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Full Stack Developer
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Wine Enthusiast - WSET LEVEL 2
              </Typography>
              
              {state.user?.displayName && state.user?.email && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {state.user.email}
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  disabled={isEditing}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Stats
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  Total Wines
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {analytics?.totalWines || 0}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  Average Rating
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '0.0'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  Member Since
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {state.user?.createdAt 
                    ? new Date(state.user.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Profile Info" />
                  <Tab label="Activity" />
                  <Tab label="Settings" />
                </Tabs>
              </Box>

              {/* Profile Info Tab */}
              <TabPanel value={tabValue} index={0}>
                {isEditing ? (
                  <form onSubmit={form.handleSubmit(handleSave)}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="displayName"
                          control={form.control}
                          rules={{
                            required: 'Display name is required',
                            minLength: {
                              value: 2,
                              message: 'Display name must be at least 2 characters',
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Display Name"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              InputProps={{
                                startAdornment: (
                                  <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="email"
                          control={form.control}
                          rules={{
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Email"
                              type="email"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              InputProps={{
                                startAdornment: (
                                  <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading || !form.formState.isValid}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Display Name
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {state.user?.displayName || 'Not set'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {state.user?.email || 'Not set'}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                
                <List>
                  {getRecentActivity().map((activity) => (
                    <ListItem key={activity.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.subtitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={`${activity.rating}/5`}
                        size="small"
                        color="primary"
                        icon={<StarIcon />}
                      />
                    </ListItem>
                  ))}
                </List>

                {wines.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No activity yet. Start by adding your first wine!
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Top Rated Wines
                </Typography>
                
                <Grid container spacing={2}>
                  {getTopWines().map((wine) => (
                    <Grid item xs={12} sm={6} md={4} key={wine.id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {wine.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {wine.grape} • {wine.region}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {wine.rating}/5
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Account Settings
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.theme.mode === 'dark'}
                        onChange={toggleTheme}
                      />
                    }
                    label="Dark Mode"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Toggle between light and dark theme
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Notifications
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Receive updates about new features and tips
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Weekly Wine Recommendations"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Get personalized wine suggestions based on your preferences
                  </Typography>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 