
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useApp } from '@/context/AppContext';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const { addNotification } = useApp();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && !scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open]);

  const initializeScanner = async () => {
    if (!containerRef.current) return;

    try {
      setScanning(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      scannerRef.current = new Html5QrcodeScanner(
        'barcode-scanner',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScanning(false);
          onScan(decodedText);
          onClose();
        },
        (errorMessage) => {
          console.log('Scan error:', errorMessage);
          addNotification({
            type: 'warning',
            message: 'Unable to scan barcode. Please adjust the camera.',
          });
        }
      );
    } catch (err) {
      setError('Failed to initialize camera. Please check camera permissions.');
      setScanning(false);
      addNotification({
        type: 'error',
        message: 'Failed to initialize camera. Please check permissions.',
      });
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScannerIcon color="primary" />
          <Typography variant="h6">Scan Barcode</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Position the barcode within the scanning area
          </Typography>
        </Box>

        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {scanning ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Initializing camera...
              </Typography>
            </Box>
          ) : (
            <div id="barcode-scanner">
              <video ref={videoRef} style={{ width: '100%' }} />
            </div>
          )}
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Supported formats: EAN-13, UPC-A, Code 128, QR Code
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}