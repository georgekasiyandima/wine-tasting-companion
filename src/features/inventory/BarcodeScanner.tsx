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
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  WineBar as WineIcon,
  LocalFlorist as EcoIcon,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useApp } from '@/context/AppContext';
import { Wine } from '@/types';

interface BarcodeScannerProps {
  onWineDetected: (wineData: Wine) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onWineDetected, onClose }: BarcodeScannerProps) {
  const theme = useTheme();
  const { addNotification } = useApp();
  const [scanning, setScanning] = useState(false);
  const [detectedWine, setDetectedWine] = useState<Wine | null>(null);
  const [processing, setProcessing] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Error clearing scanner:', error);
        });
        scannerRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const startBarcodeScanner = async () => {
    setScanning(true);
    setProcessing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      scannerRef.current = new Html5QrcodeScanner(
        'barcode-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        (error) => {
          console.warn('Scan error:', error);
          addNotification({
            type: 'warning',
            message: 'Unable to scan barcode. Please adjust the camera.',
          });
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      addNotification({
        type: 'error',
        message: 'Failed to start barcode scanner. Check camera permissions.',
      });
      setProcessing(false);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error('Error clearing scanner:', error);
      });
      scannerRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setProcessing(false);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setProcessing(true);

    try {
      const wineData = await fetchWineDataFromBarcode(barcode);
      setDetectedWine(wineData);
      stopScanner();
    } catch (error) {
      console.error('Error fetching wine data:', error);
      addNotification({
        type: 'error',
        message: `Failed to fetch wine information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const fetchWineDataFromBarcode = async (barcode: string): Promise<Wine> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockWineDatabase: Record<string, Wine> = {
      '1234567890123': {
        name: 'Château Margaux 2015',
        vintage: 2015,
        region: 'Bordeaux, France',
        grape: 'Cabernet Sauvignon',
        winery: 'Château Margaux',
        rating: 0,
        price: 850,
        sustainability: 'conventional',
        barcode: '1234567890123',
        timestamp: new Date().toISOString(),
      },
      '9876543210987': {
        name: 'Barolo Riserva 2018',
        vintage: 2018,
        region: 'Piedmont, Italy',
        grape: 'Nebbiolo',
        winery: 'Gaja',
        rating: 0,
        price: 120,
        sustainability: 'organic',
        barcode: '9876543210987',
        timestamp: new Date().toISOString(),
      },
      '4567891234567': {
        name: 'Prosecco Superiore DOCG',
        vintage: 2023,
        region: 'Veneto, Italy',
        grape: 'Glera',
        winery: 'Valdobbiadene',
        rating: 0,
        price: 25,
        sustainability: 'biodynamic',
        barcode: '4567891234567',
        timestamp: new Date().toISOString(),
      },
    };

    const wineData = mockWineDatabase[barcode];
    if (!wineData) {
      throw new Error('Wine not found in database. Try manual entry.');
    }

    return wineData;
  };

  const handleLabelImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    try {
      const wineData = await processLabelImage(file);
      setDetectedWine(wineData);
    } catch (error) {
      console.error('Error processing label:', error);
      addNotification({
        type: 'error',
        message: `Failed to process wine label image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const processLabelImage = async (file: File): Promise<Wine> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      name: 'Chianti Classico Riserva 2019',
      vintage: 2019,
      region: 'Tuscany, Italy',
      grape: 'Sangiovese',
      winery: 'Castello di Ama',
      rating: 0,
      price: 45,
      sustainability: 'organic',
      barcode: '7891234567890',
      timestamp: new Date().toISOString(),
    };
  };

  const handleConfirmWine = () => {
    if (detectedWine && detectedWine.name && detectedWine.region && detectedWine.grape) {
      onWineDetected(detectedWine);
      addNotification({
        type: 'success',
        message: 'Wine added to inventory successfully!',
      });
      setDetectedWine(null);
      setManualEntry(false);
      onClose();
    } else {
      addNotification({
        type: 'error',
        message: 'Please fill in all required fields (Name, Region, Grape).',
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
      rating: 0,
      barcode: '',
      timestamp: new Date().toISOString(),
    });
    stopScanner();
  };

  const getSustainabilityColor = (sustainability?: string) => {
    switch (sustainability) {
      case 'organic':
        return 'success';
      case 'biodynamic':
        return 'primary';
      case 'conventional':
      default:
        return 'default';
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
          <Typography variant="h6">Wine Barcode Scanner</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="Wine Inventory" color="secondary" size="small" icon={<WineIcon />} />
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!detectedWine && !manualEntry && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Scan wine barcodes or upload label images to automatically add wines to your inventory.
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
                      <Typography variant="body2" color="text.secondary">
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
                        <div id="barcode-reader">
                          <video ref={videoRef} style={{ width: '100%' }} />
                        </div>
                        <Button variant="outlined" fullWidth onClick={stopScanner} sx={{ mt: 2 }}>
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
                      <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Or enter wine details manually
              </Typography>
              <Button variant="outlined" onClick={handleManualEntry} startIcon={<WineIcon />}>
                Manual Entry
              </Button>
            </Box>
          </Box>
        )}

        {(detectedWine || manualEntry) && (
          <Box>
            <Alert severity={manualEntry ? 'info' : 'success'} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {manualEntry ? 'Manual Wine Entry' : 'Wine Detected Successfully!'}
              </Typography>
              {!manualEntry && (
                <Typography variant="body2">
                  Confidence: {(detectedWine?.confidence || 0) * 100}%)
                </Typography>
              )}
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
                      value={detectedWine?.name || ''}
                      onChange={(e) =>
                        setDetectedWine({ ...detectedWine!, name: e.target.value })
                      }
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vintage"
                      type="number"
                      value={detectedWine?.vintage || new Date().getFullYear()}
                      onChange={(e) =>
                        setDetectedWine({
                          ...detectedWine!,
                          vintage: parseInt(e.target.value) || new Date().getFullYear(),
                        })
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={detectedWine?.region || ''}
                      onChange={(e) =>
                        setDetectedWine({ ...detectedWine!, region: e.target.value })
                      }
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grape Variety"
                      value={detectedWine?.grape || ''}
                      onChange={(e) =>
                        setDetectedWine({ ...detectedWine!, grape: e.target.value })
                      }
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Winery"
                      value={detectedWine?.winery || ''}
                      onChange={(e) =>
                        setDetectedWine({ ...detectedWine!, winery: e.target.value })
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price ($)"
                      type="number"
                      value={detectedWine?.price || ''}
                      onChange={(e) =>
                        setDetectedWine({
                          ...detectedWine!,
                          price: parseFloat(e.target.value) || undefined,
                        })
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Barcode (Optional)"
                      value={detectedWine?.barcode || ''}
                      onChange={(e) =>
                        setDetectedWine({ ...detectedWine!, barcode: e.target.value })
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Sustainability</InputLabel>
                      <Select
                        value={detectedWine?.sustainability || 'conventional'}
                        onChange={(e) =>
                          setDetectedWine({
                            ...detectedWine!,
                            sustainability: e.target.value as 'organic' | 'biodynamic' | 'conventional',
                          })
                        }
                        label="Sustainability"
                      >
                        <MenuItem value="conventional">Conventional</MenuItem>
                        <MenuItem value="organic">Organic</MenuItem>
                        <MenuItem value="biodynamic">Biodynamic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {detectedWine?.barcode && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`Barcode: ${detectedWine.barcode}`} variant="outlined" size="small" />
                    {detectedWine.sustainability && (
                      <Chip
                        label={detectedWine.sustainability}
                        color={getSustainabilityColor(detectedWine.sustainability)}
                        icon={getSustainabilityIcon(detectedWine.sustainability)}
                        size="small"
                      />
                    )}
                    {!manualEntry && detectedWine.confidence && (
                      <Chip
                        label={`Confidence: ${(detectedWine.confidence * 100).toFixed(0)}%`}
                        color="info"
                        size="small"
                      />
                    )}
                  </Box>
                )}
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