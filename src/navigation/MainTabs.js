import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NetworkScreen       from '../screens/NetworkScreen';
import PeopleScreen        from '../screens/PeopleScreen';
import InsightsScreen      from '../screens/InsightsScreen';
import AddEditPersonScreen from '../screens/AddEditPersonScreen';
import DetailScreen        from '../screens/DetailScreen';
import AddConnectionScreen from '../screens/AddConnectionScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, focused }) {
  const icons = { Network: '◉', People: '☰', Insights: '◈' };
  return (
    <Text style={{ fontSize: 18, color: focused ? '#185fa5' : '#9ca3af' }}>
      {icons[name] || '●'}
    </Text>
  );
}

function TabLabel({ name, focused }) {
  return (
    <Text style={{ fontSize: 10, color: focused ? '#185fa5' : '#9ca3af', fontWeight: focused ? '700' : '400' }}>
      {name}
    </Text>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => <TabLabel name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Network"  component={NetworkScreen} />
      <Tab.Screen name="People"   component={PeopleScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"           component={Tabs} />
      <Stack.Screen name="AddEditPerson"  component={AddEditPersonScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Detail"         component={DetailScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="AddConnection"  component={AddConnectionScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
});
