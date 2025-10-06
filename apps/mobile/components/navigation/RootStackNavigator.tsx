import TabNavigator from '@/components/navigation/TabNavigator';
import StackScreen from '@/screens/StackScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Tabs' component={TabNavigator} />
      <Stack.Screen name='Stack' component={StackScreen} />
    </Stack.Navigator>
  );
}
