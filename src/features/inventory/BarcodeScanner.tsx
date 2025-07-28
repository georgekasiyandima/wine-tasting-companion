import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  WineBar as WineIcon,
  Eco as EcoIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useApp } from '@/context/AppContext';

interface WineLabelData {
  name: string;
  vintage: number;
  region: string;
  grape: string;
  winery: string;
  price?: number;
  sustainability?: 'organic' | 'biodynamic' | 'conventional';
  barcode: string;
  confidence: number;
}

interface BarcodeScannerProps {
  onWineDetected: (wineData: WineLabelData) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onWineDetected, onClose }: BarcodeScannerProps) {
  const theme = useTheme();
  const { addNotification } = useApp();
  const [scanning, setScanning] = useState(false);
  const [detectedWine, setDetectedWine] = useState<WineLabelData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'label'>('barcode');
  const [manualEntry, setManualEntry] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startBarcodeScanner = () => {
    setScanning(true);
    setProcessing(true);

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "barcode-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        (error) => {
          // Ignore scanning errors
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      addNotification({
        type: 'error',
        message: 'Failed to start barcode scanner',
      });
      setProcessing(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
    setProcessing(false);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setProcessing(true);
    
    try {
      // Simulate API call to wine database
      const wineData = await fetchWineDataFromBarcode(barcode);
      setDetectedWine(wineData);
      stopScanner();
    } catch (error) {
      console.error('Error fetching wine data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to fetch wine information from barcode',
      });
    } finally {
      setProcessing(false);
    }
  };

  const fetchWineDataFromBarcode = async (barcode: string): Promise<WineLabelData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock wine database lookup
    const mockWineDatabase: Record<string, WineLabelData> = {
      '1234567890123': {
        name: 'Château Margaux 2015',
        vintage: 2015,
        region: 'Bordeaux, France',
        grape: 'Cabernet Sauvignon',
        winery: 'Château Margaux',
        price: 850,
        sustainability: 'conventional',
        barcode: '1234567890123',
        confidence: 0.95,
      },
      '9876543210987': {
        name: 'Barolo Riserva 2018',
        vintage: 2018,
        region: 'Piedmont, Italy',
        grape: 'Nebbiolo',
        winery: 'Gaja',
        price: 120,
        sustainability: 'organic',
        barcode: '9876543210987',
        confidence: 0.92,
      },
      '4567891234567': {
        name: 'Prosecco Superiore DOCG',
        vintage: 2023,
        region: 'Veneto, Italy',
        grape: 'Glera',
        winery: 'Valdobbiadene',
        price: 25,
        sustainability: 'biodynamic',
        barcode: '4567891234567',
        confidence: 0.88,
      },
    };

    const wineData = mockWineDatabase[barcode];
    if (!wineData) {
      throw new Error('Wine not found in database');
    }

    return wineData;
  };

  const handleLabelImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    
    try {
      // Simulate label recognition API
      const wineData = await processLabelImage(file);
      setDetectedWine(wineData);
    } catch (error) {
      console.error('Error processing label:', error);
      addNotification({
        type: 'error',
        message: 'Failed to process wine label image',
      });
    } finally {
      setProcessing(false);
    }
  };

  const processLabelImage = async (file: File): Promise<WineLabelData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock label recognition results
    const mockLabelData: WineLabelData = {
      name: 'Chianti Classico Riserva 2019',
      vintage: 2019,
      region: 'Tuscany, Italy',
      grape: 'Sangiovese',
      winery: 'Castello di Ama',
      price: 45,
      sustainability: 'organic',
      barcode: '7891234567890',
      confidence: 0.87,
    };

    return mockLabelData;
  };

  const handleConfirmWine = () => {
    if (detectedWine) {
      onWineDetected(detectedWine);
      addNotification({
        type: 'success',
        message: 'Wine added to inventory successfully!',
      });
    }
  };

  const handleManualEntry = () => {
    setManualEntry(true);
    setDetectedWine({
      name: '',
      vintage: new Date().getFullYear(),
      region: '',
      grape: '',
      winery: '',
      barcode: '',
      confidence: 0,
    });
  };

  const getSustainabilityColor = (sustainability?: string) => {
    switch (sustainability) {
      case 'organic': return 'success';
      case 'biodynamic': return 'primary';
      case 'conventional': return 'default';
      default: return 'default';
    }
  };

  const getSustainabilityIcon = (sustainability?: string) => {
    if (sustainability === 'organic' || sustainability === 'biodynamic') {
      return <EcoIcon />;
    }
    return null;
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Cruise Ship Wine Scanner
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={scanMode === 'barcode' ? 'Barcode' : 'Label'}
              color="primary"
              size="small"
            />
            <Chip
              label="Cruise Inventory"
              color="secondary"
              size="small"
              icon={<WineIcon />}
            />
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!detectedWine && !manualEntry && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Scan wine barcodes or upload label images to automatically add wines to your cruise ship inventory.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <ScannerIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Barcode Scanner
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Scan wine barcodes for instant recognition
                      </Typography>
                    </Box>
                    
                    {!scanning ? (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={startBarcodeScanner}
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : <ScannerIcon />}
                      >
                        {processing ? 'Starting Scanner...' : 'Start Scanner'}
                      </Button>
                    ) : (
                      <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Position the barcode within the scanning area
                        </Alert>
                        <div id="barcode-reader"></div>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={stopScanner}
                          sx={{ mt: 2 }}
                        >
                          Stop Scanner
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <CameraIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Label Recognition
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Upload wine label images for AI recognition
                      </Typography>
                    </Box>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleLabelImageUpload}
                    />
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={20} /> : <UploadIcon />}
                      color="secondary"
                    >
                      {processing ? 'Processing Image...' : 'Upload Label Image'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Or enter wine details manually
              </Typography>
              <Button
                variant="outlined"
                onClick={handleManualEntry}
                startIcon={<InfoIcon />}
              >
                Manual Entry
              </Button>
            </Box>
          </Box>
        )}

        {detectedWine && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Wine Detected Successfully!
              </Typography>
              <Typography variant="body2">
                Confidence: {(detectedWine.confidence * 100).toFixed(1)}%
              </Typography>
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Wine Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Wine Name"
                      value={detectedWine.name}
                      onChange={(e) => setDetectedWine({...detectedWine, name: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vintage"
                      type="number"
                      value={detectedWine.vintage}
                      onChange={(e) => setDetectedWine({...detectedWine, vintage: parseInt(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={detectedWine.region}
                      onChange={(e) => setDetectedWine({...detectedWine, region: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grape Variety"
                      value={detectedWine.grape}
                      onChange={(e) => setDetectedWine({...detectedWine, grape: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Winery"
                      value={detectedWine.winery}
                      onChange={(e) => setDetectedWine({...detectedWine, winery: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price ($)"
                      type="number"
                      value={detectedWine.price || ''}
                      onChange={(e) => setDetectedWine({...detectedWine, price: parseFloat(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Sustainability</InputLabel>
                      <Select
                        value={detectedWine.sustainability || 'conventional'}
                        onChange={(e) => setDetectedWine({...detectedWine, sustainability: e.target.value as any})}
                        label="Sustainability"
                      >
                        <MenuItem value="conventional">Conventional</MenuItem>
                        <MenuItem value="organic">Organic</MenuItem>
                        <MenuItem value="biodynamic">Biodynamic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Barcode: ${detectedWine.barcode}`}
                    variant="outlined"
                    size="small"
                  />
                  {detectedWine.sustainability && (
                    <Chip
                      label={detectedWine.sustainability}
                      color={getSustainabilityColor(detectedWine.sustainability) as any}
                      icon={getSustainabilityIcon(detectedWine.sustainability)}
                      size="small"
                    />
                  )}
                  <Chip
                    label={`Confidence: ${(detectedWine.confidence * 100).toFixed(0)}%`}
                    color="info"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {manualEntry && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter wine details manually for inventory tracking
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manual Wine Entry
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Wine Name"
                      value={detectedWine?.name || ''}
                      onChange={(e) => setDetectedWine({...detectedWine!, name: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vintage"
                      type="number"
                      value={detectedWine?.vintage || new Date().getFullYear()}
                      onChange={(e) => setDetectedWine({...detectedWine!, vintage: parseInt(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={detectedWine?.region || ''}
                      onChange={(e) => setDetectedWine({...detectedWine!, region: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grape Variety"
                      value={detectedWine?.grape || ''}
                      onChange={(e) => setDetectedWine({...detectedWine!, grape: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Winery"
                      value={detectedWine?.winery || ''}
                      onChange={(e) => setDetectedWine({...detectedWine!, winery: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Barcode (Optional)"
                      value={detectedWine?.barcode || ''}
                      onChange={(e) => setDetectedWine({...detectedWine!, barcode: e.target.value})}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Sustainability</InputLabel>
                      <Select
                        value={detectedWine?.sustainability || 'conventional'}
                        onChange={(e) => setDetectedWine({...detectedWine!, sustainability: e.target.value as any})}
                        label="Sustainability"
                      >
                        <MenuItem value="conventional">Conventional</MenuItem>
                        <MenuItem value="organic">Organic</MenuItem>
                        <MenuItem value="biodynamic">Biodynamic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {(detectedWine || manualEntry) && (
          <Button
            variant="contained"
            onClick={handleConfirmWine}
            startIcon={<CheckIcon />}
            disabled={!detectedWine?.name || !detectedWine?.region || !detectedWine?.grape}
          >
            Add to Inventory
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 