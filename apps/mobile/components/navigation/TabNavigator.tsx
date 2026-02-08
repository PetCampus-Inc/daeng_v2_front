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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ focused }) => {
            const iconProps = {
              fill: focused ? '#41424A' : '#8C8C94',
              color: focused ? '#41424A' : '#8C8C94',
            };

            switch (route.name) {
              case 'Explore':
                return <ExploreIcon width={21} height={21} {...iconProps} />;
              case 'Save':
                return <SaveIcon width={21} height={21} {...iconProps} />;
              case 'Compare':
                return <CompareIcon width={25} height={25} {...iconProps} />;
              case 'Mypage':
                return <MypageIcon width={24} height={24} style={{ marginTop: 2 }} {...iconProps} />;
              default:
                console.warn('❗ tabBarIcon: Unknown route name', route.name);
                return null;
            }
          },
          tabBarActiveTintColor: '#41424A',
          tabBarInactiveTintColor: '#8C8C94',
          tabBarStyle: {
            paddingBottom: bottom,
            paddingLeft: 12,
            paddingRight: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 2,
          },
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name='Explore' component={ExploreTab} options={{ title: '내 주변' }} />
      <Tab.Screen name='Save' component={SaveTab} options={{ title: '보관함' }} />
      <Tab.Screen name='Compare' component={CompareTab} options={{ title: '유치원' }} />
      <Tab.Screen name='Mypage' component={MypageTab} options={{ title: '마이' }} />
    </Tab.Navigator>
  );
}
