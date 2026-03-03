/**
 * QR Scan Screen
 * 
 * Allows users to scan QR codes from ESP32 controllers to pair them.
 * Uses Expo Camera for Expo Go compatibility.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {Text, Button, Surface, ActivityIndicator} from 'react-native-paper';
import {CameraView, CameraType, useCameraPermissions} from 'expo-camera';
import {useNavigation} from '@react-navigation/native';
import {pairController} from '../../services/controllerService';

const QRScanScreen = () => {
  const navigation = useNavigation();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes');
      navigation.goBack();
    }
  }, [permission, navigation]);

  const handleBarCodeScanned = async ({data}: {data: string}) => {
    if (loading || !data) return;

    setLoading(true);
    setScanning(false);

    try {
      await pairController({qr_token: data});
      Alert.alert(
        'Success',
        'Controller paired successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Refresh controllers list
              navigation.navigate('Controllers' as never);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Pairing Failed',
        error.message || 'Could not pair controller',
      );
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }
    }
    setScanning(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Pairing controller...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.infoCard} elevation={2}>
        <Text variant="titleMedium" style={styles.infoTitle}>
          Scan Controller QR Code
        </Text>
        <Text variant="bodyMedium" style={styles.infoText}>
          Point your camera at the QR code displayed on your ESP32 controller
          to pair it with your account.
        </Text>
      </Surface>

      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={CameraType.back}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
            <Button
              mode="outlined"
              onPress={() => setScanning(false)}
              style={styles.button}>
              Cancel
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Button
            mode="contained"
            onPress={startScanning}
            style={styles.button}
            icon="qrcode-scan">
            Start Scanning
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#666',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default QRScanScreen;
