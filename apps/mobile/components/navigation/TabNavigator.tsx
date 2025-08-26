import CompareIcon from '@/assets/icons/compare_basic.svg';
import ExploreIcon from '@/assets/icons/explore_basic.svg';
import MypageIcon from '@/assets/icons/mypage_basic.svg';
import SaveIcon from '@/assets/icons/save_basic.svg';
import CompareTab from '@/screens/compare';
import ExploreTab from '@/screens/explore';
import MypageTab from '@/screens/mypage';
import SaveTab from '@/screens/save';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
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
                console.warn('❗ tabBarIcon: Unknown route name', route.name);
                return null;
            }
          },
          tabBarActiveTintColor: '#FF6F0F',
          tabBarInactiveTintColor: '#C2C2C2',
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name='Explore' component={ExploreTab} options={{ title: '탐색' }} />
      <Tab.Screen name='Save' component={SaveTab} options={{ title: '저장' }} />
      <Tab.Screen name='Compare' component={CompareTab} options={{ title: '비교' }} />
      <Tab.Screen name='Mypage' component={MypageTab} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
  );
}
