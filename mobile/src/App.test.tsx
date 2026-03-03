/**
 * Simple test to verify app can load
 * This helps identify if there's a runtime issue
 */

import React from 'react';
import {View, Text} from 'react-native';

// Minimal test component
export const TestApp = () => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Spectron App Loading...</Text>
    </View>
  );
};
