# Running Spectron with Expo Go

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Expo:**
   ```bash
   npm start
   ```

3. **Open in Expo Go:**
   - Install Expo Go app on your phone (App Store/Play Store)
   - Scan the QR code shown in terminal/browser
   - The app will load in Expo Go

## Important Notes

- **Updates are disabled** in `app.config.js` to prevent remote update errors
- All packages are Expo Go compatible:
  - Using `@expo/vector-icons` instead of `react-native-vector-icons`
  - Using `expo-camera` for QR scanning
  - Using `fetch` API instead of `axios`

## Troubleshooting

If you see errors:

1. **Clear cache:**
   ```bash
   npm start -- --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   npm start -- --clear
   ```

3. **Check Expo Go version:**
   - Make sure you have the latest Expo Go app
   - Update if needed from App Store/Play Store

## Configuration

- Babel: Uses `babel-preset-expo`
- Metro: Uses Expo's Metro config
- Entry: Uses `registerRootComponent` from Expo
