// App.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';

import CompareIcon from '@/assets/icons/compare_basic.svg';
import ExploreIcon from '@/assets/icons/explore_basic.svg';
import MypageIcon from '@/assets/icons/mypage_basic.svg';
import SaveIcon from '@/assets/icons/save_basic.svg';

import CompareTab from './screens/compare';
import ExploreTab from './screens/explore';
import MypageTab from './screens/mypage';
import SaveTab from './screens/save';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const iconProps = {
            width: 24,
            height: 24,
            fill: focused ? '#FF6F0F' : '#C2C2C2',
          };
          switch (route.name) {
            case 'Explore':
              return <ExploreIcon {...iconProps} />;
            case 'Save':
              return <SaveIcon {...iconProps} />;
            case 'Compare':
              return <CompareIcon {...iconProps} />;
            case 'Mypage':
              return <MypageIcon {...iconProps} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: '#FF6F0F',
        tabBarInactiveTintColor: '#C2C2C2',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name='Explore'
        component={ExploreTab}
        options={{ title: '탐색' }}
      />
      <Tab.Screen name='Save' component={SaveTab} options={{ title: '저장' }} />
      <Tab.Screen
        name='Compare'
        component={CompareTab}
        options={{ title: '비교' }}
      />
      <Tab.Screen
        name='Mypage'
        component={MypageTab}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style='auto' />
      <Stack.Navigator>
        <Stack.Screen
          name='Main'
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
