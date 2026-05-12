import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs    from './src/navigation/MainTabs';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <AppProvider>
      <StatusBar style="dark" />
      {loggedIn ? (
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      ) : (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      )}
    </AppProvider>
  );
}
