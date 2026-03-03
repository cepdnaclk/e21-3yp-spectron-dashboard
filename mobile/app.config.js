export default {
  expo: {
    name: 'Spectron',
    slug: 'spectron',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#6200ee',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.spectron.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#6200ee',
      },
      package: 'com.spectron.app',
      permissions: ['CAMERA'],
    },
    plugins: [],
    updates: {
      enabled: false,
      checkAutomatically: 'NEVER',
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    jsEngine: 'hermes',
  },
};
