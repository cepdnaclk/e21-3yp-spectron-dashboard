/**
 * App Navigator
 * 
 * Main navigation structure for the app.
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../contexts/AuthContext';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';

// Auth Screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Main Screens
import ControllersScreen from '../screens/main/ControllersScreen';
import ControllerDashboardScreen from '../screens/main/ControllerDashboardScreen';
import SensorConfigScreen from '../screens/main/SensorConfigScreen';
import MonitoringScreen from '../screens/main/MonitoringScreen';
import AlertsScreen from '../screens/main/AlertsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// QR Scanner
import QRScanScreen from '../screens/main/QRScanScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator (shown after login)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
      }}>
      <Tab.Screen
        name="Controllers"
        component={ControllersScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="chip" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Monitoring"
        component={MonitoringScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="bell" size={size} color={color} />
          ),
          tabBarBadge: undefined, // Can be set dynamically
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          // User is logged in
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="ControllerDashboard"
              component={ControllerDashboardScreen}
              options={{headerShown: true, title: 'Controller Dashboard'}}
            />
            <Stack.Screen
              name="SensorConfig"
              component={SensorConfigScreen}
              options={{headerShown: true, title: 'Configure Sensor'}}
            />
            <Stack.Screen
              name="QRScan"
              component={QRScanScreen}
              options={{headerShown: true, title: 'Scan QR Code'}}
            />
          </>
        ) : (
          // User is not logged in
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
