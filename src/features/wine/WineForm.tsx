import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  QrCodeScanner as BarcodeIcon,
  WineBar as WineIcon,
  AutoAwesome as AIIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useApp } from '@/context/AppContext';
import { Wine } from '@/types';
import { WineService, uploadWineImage } from '@/services/firebase';
import {
  WINE_CLARITY_OPTIONS,
  WINE_INTENSITY_OPTIONS,
  WINE_COLOUR_OPTIONS,
  NOSE_CONDITION_OPTIONS,
  NOSE_INTENSITY_OPTIONS,
  PRIMARY_AROMA_OPTIONS,
  SECONDARY_AROMA_OPTIONS,
  TERTIARY_AROMA_OPTIONS,
  PALATE_OPTIONS,
  QUALITY_OPTIONS,
  POPULAR_REGIONS,
  POPULAR_GRAPES,
  RATING_LABELS,
} from '@/constants';
import { aiService, AISuggestion } from '@/services/ai';
import BarcodeScanner from './BarcodeScanner';

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
      id={`tasting-tabpanel-${index}`}
      aria-labelledby={`tasting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const steps = [
  'Basic Information',
  'Appearance',
  'Nose',
  'Aromas & Flavors',
  'Palate',
  'Conclusions',
  'Review & Save'
];

export default function WineForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, addNotification } = useApp();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tastingTabValue, setTastingTabValue] = useState(0);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    appearance: AISuggestion | null;
    nose: AISuggestion | null;
    palate: AISuggestion | null;
    conclusions: AISuggestion | null;
  } | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [foodPairings, setFoodPairings] = useState<string[]>([]);
  const [fetchingFood, setFetchingFood] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<Wine>({
    defaultValues: {
      name: '',
      grape: '',
      region: '',
      vintage: new Date().getFullYear().toString(),
      rating: 3,
      price: undefined,
      imageUrl: '',
      barcode: '',
      tasting: {
        appearance: {
          clarity: '',
          intensity: '',
          colour: '',
        },
        nose: {
          condition: '',
          intensity: '',
        },
        aromaFlavour: {
          primary: {
            floral: '',
            greenFruit: '',
            citrusFruit: '',
            stoneFruit: '',
            tropicalFruit: '',
            redFruit: '',
            blackFruit: '',
            herbaceous: '',
            herbal: '',
            spice: '',
            fruitRipeness: '',
            other: '',
          },
          secondary: {
            yeast: '',
            malolactic: '',
            oak: '',
          },
          tertiary: {
            redWine: '',
            whiteWine: '',
            oxidised: '',
          },
        },
        palate: {
          sweetness: '',
          acidity: '',
          tannin: '',
          alcohol: '',
          body: '',
          flavourIntensity: '',
          finish: '',
        },
        conclusions: {
          quality: '',
          readiness: '',
          ageing: '',
        },
        notes: '',
      },
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (id) {
      loadWine();
    }
  }, [id]);

  const loadWine = async () => {
    try {
      setLoading(true);
      const wine = await WineService.getWine(id || '', state.user?.id);
      if (wine) {
        reset(wine);
        if (wine.imageUrl) {
          setImagePreview(wine.imageUrl);
        }
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load wine',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && state.user?.id) {
      setUploading(true);
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
        };
        reader.readAsDataURL(file);

        // Upload to Firebase Storage
        const url = await uploadWineImage(file, state.user.id);
        setValue('imageUrl', url);
        setImagePreview(url);
        addNotification({
          type: 'success',
          message: 'Image uploaded successfully!',
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to upload image',
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleBarcodeScan = () => {
    setScannerOpen(true);
  };

  const handleScanResult = (barcode: string) => {
    setValue('barcode', barcode);
    addNotification({
      type: 'success',
      message: `Barcode scanned: ${barcode}`,
    });
  };

  const generateAISuggestions = async () => {
    const { grape, region, vintage } = watchedValues;
    
    if (!grape || !region || !vintage) {
      addNotification({
        type: 'warning',
        message: 'Please fill in grape, region, and vintage to generate AI suggestions',
      });
      return;
    }

    try {
      setGeneratingAI(true);
      const suggestions = await aiService.generateTastingNotes({
        grape,
        region,
        vintage,
        price: watchedValues.price,
      });
      
      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
      addNotification({
        type: 'success',
        message: 'AI suggestions generated successfully!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to generate AI suggestions',
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const applyAISuggestion = (category: string, suggestion: string) => {
    switch (category) {
      case 'appearance':
        setValue('tasting.appearance.clarity', suggestion);
        break;
      case 'nose':
        setValue('tasting.nose.condition', suggestion);
        break;
      case 'palate':
        setValue('tasting.palate.sweetness', suggestion);
        break;
      case 'conclusions':
        setValue('tasting.conclusions.quality', suggestion);
        break;
    }
  };

  const onSubmit = async (data: Wine) => {
    try {
      setLoading(true);
      if (id) {
        await WineService.updateWine(id, data, state.user?.id);
        addNotification({
          type: 'success',
          message: 'Wine updated successfully!',
        });
      } else {
        await WineService.addWine(data, state.user?.id);
        addNotification({
          type: 'success',
          message: 'Wine added successfully!',
        });
      }
      navigate('/wines');
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to save wine',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFoodDialog = async () => {
    setFoodDialogOpen(true);
    setFetchingFood(true);
    try {
      const pairings = await aiService.suggestFoodPairings(watchedValues.grape, watchedValues.region);
      setFoodPairings(pairings);
    } catch (e) {
      setFoodPairings([]);
    } finally {
      setFetchingFood(false);
    }
  };

  const handleCopyPairing = (pairing: string) => {
    setValue('tasting.notes', (watchedValues.tasting?.notes || '') + `\nFood pairing: ${pairing}`);
    addNotification({
      type: 'success',
      message: 'Food pairing copied to tasting notes!',
    });
  };

  const renderBasicInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Wine name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Wine Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              placeholder="e.g., Château Margaux 2015"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="vintage"
          control={control}
          rules={{ required: 'Vintage is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Vintage"
              type="number"
              error={!!errors.vintage}
              helperText={errors.vintage?.message}
              inputProps={{ min: 1900, max: new Date().getFullYear() }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="grape"
          control={control}
          rules={{ required: 'Grape variety is required' }}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={POPULAR_GRAPES}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grape Variety"
                  error={!!errors.grape}
                  helperText={errors.grape?.message}
                />
              )}
              onChange={(_, value) => setValue('grape', value || '')}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="region"
          control={control}
          rules={{ required: 'Region is required' }}
          render={({ field }) => (
            <Autocomplete
              {...field}
              options={POPULAR_REGIONS}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region"
                  error={!!errors.region}
                  helperText={errors.region?.message}
                />
              )}
              onChange={(_, value) => setValue('region', value || '')}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Price ($)"
              type="number"
              placeholder="Optional"
              inputProps={{ min: 0, step: 0.01 }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="barcode"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Barcode"
              placeholder="Optional"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleBarcodeScan}>
                    <BarcodeIcon />
                  </IconButton>
                ),
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Rating</Typography>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rating
                {...field}
                value={field.value}
                onChange={(_, value) => setValue('rating', value || 3)}
                size="large"
              />
            )}
          />
          <Chip
            label={RATING_LABELS[watchedValues.rating as keyof typeof RATING_LABELS]}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>
          {uploading && (
            <CircularProgress size={24} sx={{ ml: 2 }} />
          )}
          {imagePreview && (
            <Avatar
              src={imagePreview}
              alt="Wine Preview"
              variant="rounded"
              sx={{ width: 56, height: 56, ml: 2 }}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );

  const renderAppearance = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Appearance
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={generateAISuggestions}
            disabled={generatingAI}
            size="small"
          >
            {generatingAI ? 'Generating...' : 'AI Suggestions'}
          </Button>
        </Box>
        
        {aiSuggestions?.appearance && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              AI Suggestions (Confidence: {Math.round(aiSuggestions.appearance.confidence * 100)}%)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {aiSuggestions.appearance.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => applyAISuggestion('appearance', suggestion)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Alert>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="tasting.appearance.clarity"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Clarity</InputLabel>
              <Select {...field} label="Clarity">
                {WINE_CLARITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="tasting.appearance.intensity"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Intensity</InputLabel>
              <Select {...field} label="Intensity">
                {WINE_INTENSITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="tasting.appearance.colour"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Colour</InputLabel>
              <Select {...field} label="Colour">
                {WINE_COLOUR_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
    </Grid>
  );

  const renderNose = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Controller
          name="tasting.nose.condition"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select {...field} label="Condition">
                {NOSE_CONDITION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="tasting.nose.intensity"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Intensity</InputLabel>
              <Select {...field} label="Intensity">
                {NOSE_INTENSITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
    </Grid>
  );

  const renderAromasFlavors = () => (
    <Box>
      <Tabs
        value={tastingTabValue}
        onChange={(_, newValue) => setTastingTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Primary" />
        <Tab label="Secondary" />
        <Tab label="Tertiary" />
      </Tabs>

      <TabPanel value={tastingTabValue} index={0}>
        <Grid container spacing={2}>
          {Object.entries(PRIMARY_AROMA_OPTIONS).map(([key, options]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Controller
                name={`tasting.aromaFlavour.primary.${key}` as any}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={options}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        size="small"
                      />
                    )}
                    onChange={(_, value) => setValue(`tasting.aromaFlavour.primary.${key}` as any, value || '')}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tastingTabValue} index={1}>
        <Grid container spacing={2}>
          {Object.entries(SECONDARY_AROMA_OPTIONS).map(([key, options]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Controller
                name={`tasting.aromaFlavour.secondary.${key}` as any}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={options}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        size="small"
                      />
                    )}
                    onChange={(_, value) => setValue(`tasting.aromaFlavour.secondary.${key}` as any, value || '')}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tastingTabValue} index={2}>
        <Grid container spacing={2}>
          {Object.entries(TERTIARY_AROMA_OPTIONS).map(([key, options]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Controller
                name={`tasting.aromaFlavour.tertiary.${key}` as any}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={options}
                    freeSolo
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        size="small"
                      />
                    )}
                    onChange={(_, value) => setValue(`tasting.aromaFlavour.tertiary.${key}` as any, value || '')}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );

  const renderPalate = () => (
    <Grid container spacing={3}>
      {Object.entries(PALATE_OPTIONS).map(([key, options]) => (
        <Grid item xs={12} sm={6} md={4} key={key}>
          <Controller
            name={`tasting.palate.${key}` as any}
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</InputLabel>
                <Select {...field} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderConclusions = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Controller
          name="tasting.conclusions.quality"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Quality Level</InputLabel>
              <Select {...field} label="Quality Level">
                {QUALITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="tasting.conclusions.readiness"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Readiness for Drinking"
              placeholder="e.g., Ready to drink, Needs aging"
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="tasting.conclusions.ageing"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Ageing Potential"
              placeholder="e.g., Drink within 2-3 years, Can age 10+ years"
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="tasting.notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Additional Notes"
              multiline
              rows={4}
              placeholder="Any additional observations, food pairing suggestions, or personal notes..."
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Wine Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={watchedValues.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginRight: 16,
                    }}
                  />
                ) : (
                  <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: theme.palette.primary.main }}>
                    <WineIcon />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6">{watchedValues.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {watchedValues.grape} • {watchedValues.region} • {watchedValues.vintage}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={watchedValues.rating} size="small" readOnly />
                    <Chip
                      label={RATING_LABELS[watchedValues.rating as keyof typeof RATING_LABELS]}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
              {watchedValues.price && (
                <Typography variant="body2">
                  <strong>Price:</strong> ${watchedValues.price}
                </Typography>
              )}
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleOpenFoodDialog}
              >
                Suggest Food Pairings
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tasting Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Clarity
                  </Typography>
                  <Typography variant="body1">
                    {watchedValues.tasting?.appearance?.clarity || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Intensity
                  </Typography>
                  <Typography variant="body1">
                    {watchedValues.tasting?.appearance?.intensity || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Body
                  </Typography>
                  <Typography variant="body1">
                    {watchedValues.tasting?.palate?.body || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Quality
                  </Typography>
                  <Typography variant="body1">
                    {watchedValues.tasting?.conclusions?.quality || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={foodDialogOpen} onClose={() => setFoodDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Suggested Food Pairings</DialogTitle>
        <DialogContent>
          {fetchingFood ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : foodPairings.length > 0 ? (
            <List>
              {foodPairings.map((pairing, idx) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleCopyPairing(pairing)}>
                      <ContentCopyIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={pairing} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No suggestions available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFoodDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderAppearance();
      case 2:
        return renderNose();
      case 3:
        return renderAromasFlavors();
      case 4:
        return renderPalate();
      case 5:
        return renderConclusions();
      case 6:
        return renderReview();
      default:
        return 'Unknown step';
    }
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/wines')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {id ? 'Edit Wine' : 'Add New Wine'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AIIcon />}
          onClick={generateAISuggestions}
          sx={{ mr: 1 }}
        >
          AI Suggestions
        </Button>
      </Box>

      {/* Image Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <IconButton component="span" color="primary">
                <PhotoCameraIcon />
              </IconButton>
            </label>
            <Typography variant="body2" color="text.secondary">
              {imagePreview ? 'Image uploaded' : 'Upload wine label or photo'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Wine'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* AI Suggestions Alert */}
      {showAISuggestions && (
        <Alert severity="info" sx={{ mt: 2 }}>
          AI-powered tasting suggestions will be available soon! This feature will analyze your wine details
          and provide intelligent recommendations for tasting notes and food pairings.
        </Alert>
      )}

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
      />
    </Box>
  );
} 