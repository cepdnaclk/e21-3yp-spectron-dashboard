import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spectron.app',
  appName: 'Spectron',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
