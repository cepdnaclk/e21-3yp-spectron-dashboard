# Troubleshooting Expo Go "Runtime Not Ready" Error

## The Problem

The error `PlatformConstants could not be found` with `Bridgeless mode: true` means React Native's new architecture is being enabled, which **Expo Go doesn't support**.

## Solutions

### Solution 1: Test with Simple App (Recommended First Step)

Temporarily replace `src/App.tsx` with a minimal version to test if Expo Go works:

1. Rename `src/App.tsx` to `src/App.full.tsx`
2. Copy `src/App.simple.tsx` to `src/App.tsx`
3. Run `npm start -- --clear`
4. Test in Expo Go

If the simple app works, the issue is with one of the packages or providers.

### Solution 2: Check Package Compatibility

Some packages might not be compatible with Expo Go:
- `react-native-chart-kit` - might need native code
- Check if all packages are Expo Go compatible

### Solution 3: Remove Android/iOS Folders (For Pure Expo Go)

If you're only using Expo Go (not building native apps), you can remove:
- `android/` folder
- `ios/` folder (if exists)

Expo Go doesn't need these - it uses its own native runtime.

### Solution 4: Use Expo SDK 52 Instead

Expo SDK 54 might have compatibility issues. Try downgrading:

```bash
npm install expo@~52.0.0
npm install
```

### Solution 5: Clear Everything and Reinstall

```bash
cd mobile
rm -rf node_modules
rm -rf .expo
rm -rf android/build
npm install
npm start -- --clear
```

## Current Configuration

- ✅ `newArchEnabled: false` in `app.config.js`
- ✅ `newArchEnabled=false` in `android/gradle.properties`
- ✅ Using `babel-preset-expo`
- ✅ Using Expo's Metro config
- ✅ All icons use `@expo/vector-icons`
- ✅ Using `fetch` instead of `axios`

## Next Steps

1. Try the simple app first (Solution 1)
2. If that works, gradually add back providers/screens to find the issue
3. If that doesn't work, try Solution 4 (downgrade Expo SDK)
