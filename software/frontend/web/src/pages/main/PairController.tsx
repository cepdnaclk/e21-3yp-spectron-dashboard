import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { CameraAlt, QrCodeScanner, CheckCircle } from '@mui/icons-material';
import { pairController, Controller } from '../../services/controllerService';

const normalizeControllerToken = (value: string): string => {
  const raw = (value || '').trim();
  if (!raw) {
    return '';
  }

  const directMatch = raw.match(/CTRL-[A-Z0-9-]+/i);
  if (directMatch) {
    return directMatch[0].toUpperCase();
  }

  try {
    const url = new URL(raw);
    const fromQuery =
      url.searchParams.get('id') ||
      url.searchParams.get('qr') ||
      url.searchParams.get('qr_token') ||
      url.searchParams.get('hw_id') ||
      '';

    if (fromQuery) {
      return normalizeControllerToken(fromQuery);
    }

    const fromPath = url.pathname.split('/').filter(Boolean).pop() || '';
    if (fromPath) {
      return normalizeControllerToken(fromPath);
    }
  } catch {
    // Not a URL - use raw token fallback below.
  }

  return raw.toUpperCase();
};

const PairController: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const [qrToken, setQrToken] = useState('');
  const [pairedController, setPairedController] = useState<Controller | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanInfo, setScanInfo] = useState('');
  const [isScannerSupported, setIsScannerSupported] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(false);

  useEffect(() => {
    const barcodeDetector = (window as any).BarcodeDetector;
    setIsScannerSupported(Boolean(barcodeDetector));
    if (barcodeDetector) {
      detectorRef.current = new barcodeDetector({ formats: ['qr_code'] });
    }

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanRafRef.current) {
      cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraRunning(false);
  };

  const scanFrame = async () => {
    if (!videoRef.current || !detectorRef.current || !isCameraRunning) {
      return;
    }

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      if (barcodes.length > 0) {
        const value = normalizeControllerToken((barcodes[0].rawValue || '').trim());
        if (value) {
          setQrToken(value);
          setScanInfo(`Scanned QR ID: ${value}`);
          stopCamera();
          return;
        }
      }
    } catch (scanError) {
      setError('Scanner is running but could not read the QR code yet. Try better lighting.');
    }

    scanRafRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setError('');
    setScanInfo('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraRunning(true);
      scanRafRef.current = requestAnimationFrame(scanFrame);
    } catch (cameraError) {
      setError('Unable to access camera. You can still enter the controller ID manually.');
    }
  };

  const handlePair = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedToken = normalizeControllerToken(qrToken);

    if (!normalizedToken) {
      setError('Please scan or enter a valid QR controller ID.');
      return;
    }

    setLoading(true);
    try {
      const controller = await pairController({ qr_token: normalizedToken });
      setQrToken(normalizedToken);
      setPairedController(controller);
    } catch (err: any) {
      const responseData = err?.response?.data;
      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message || 'Failed to pair controller. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = () => {
    if (!pairedController) {
      return;
    }
    navigate(`/controllers/${pairedController.id}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2, border: 'none', backgroundColor: 'transparent' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(235, 79, 18, 0.12)' }}>
            <QrCodeScanner color="secondary" />
          </Box>
          <Box>
            <Typography variant="overline" color="secondary" fontWeight={800}>
              Pairing flow
            </Typography>
            <Typography variant="h4">Scan Controller QR</Typography>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 680 }}>
          Scan the QR code on the controller or enter the pairing token manually. One-time tokens and legacy controller IDs are both supported.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!pairedController ? (
          <Box component="form" onSubmit={handlePair} sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(60, 57, 17, 0.08)' }}>
            {isScannerSupported ? (
              <Box sx={{ mb: 2 }}>
                {!isCameraRunning ? (
                  <Button variant="outlined" fullWidth onClick={startCamera} startIcon={<CameraAlt />}>
                    Start Camera Scanner
                  </Button>
                ) : (
                  <Button variant="outlined" color="secondary" fullWidth onClick={stopCamera} startIcon={<CameraAlt />}>
                    Stop Camera Scanner
                  </Button>
                )}
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: '#262411',
                    display: isCameraRunning ? 'block' : 'none',
                  }}
                >
                  <video ref={videoRef} style={{ width: '100%', maxHeight: 280 }} muted playsInline />
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Camera QR scanning is not supported in this browser. Enter the controller ID manually.
              </Alert>
            )}

            {scanInfo && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {scanInfo}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Pairing Token or Controller ID"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="e.g., PAIR-7X4P2L or CTRL-8F2A19"
              disabled={loading}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Pair Controller'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(60, 57, 17, 0.08)' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle fontSize="small" />
                <span>Controller paired successfully.</span>
              </Stack>
            </Alert>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Next step: fix the controller and sensors in place, then power them on.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Once powered, click Configure to view this controller and set up connected sensors.
            </Typography>
            <Button variant="contained" color="secondary" fullWidth onClick={handleConfigure}>
              Configure
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PairController;
