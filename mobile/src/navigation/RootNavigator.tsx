import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { MbtiQuizScreen } from '../screens/onboarding/MbtiQuizScreen';
import { DiscoverScreen } from '../screens/main/DiscoverScreen';
import { MatchesScreen } from '../screens/main/MatchesScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

import { DiscoverIcon, MatchesIcon, ProfileIcon } from '../components/TabIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FF4458',
      tabBarInactiveTintColor: '#888888',
      tabBarStyle: {
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    }}
  >
    <Tab.Screen
      name="DiscoverTab"
      component={DiscoverScreen}
      options={{
        tabBarLabel: 'Khám phá',
        tabBarIcon: ({ color, focused }) => (
          <DiscoverIcon color={color} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="MatchesTab"
      component={MatchesScreen}
      options={{
        tabBarLabel: 'Hội thoại',
        tabBarIcon: ({ color, focused }) => (
          <MatchesIcon color={color} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Cá nhân',
        tabBarIcon: ({ color, focused }) => (
          <ProfileIcon color={color} focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF4458" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          // 1. Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : !user?.hasProfile ? (
          // 2. Onboarding Stack
          <>
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="MbtiQuiz" component={MbtiQuizScreen} />
          </>
        ) : (
          // 3. Main Application Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: true, title: 'Trò chuyện' }}
            />
            <Stack.Screen
              name="MbtiQuiz"
              component={MbtiQuizScreen}
              options={{ headerShown: true, title: 'Trắc nghiệm MBTI' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
