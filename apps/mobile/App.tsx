import { NavigationContainer } from '@react-navigation/native';
// import { StatusBar } from "expo-status-bar";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import TabNavigator from "./components/navigation/TabNavigator";
// // export default function App() {
//     return (
//         <NavigationContainer>
//             <StatusBar style="auto" />
//             <TabNavigator />
//         </NavigationContainer>
//     );
// }

import RootStackNavigator from './components/navigation/RootStackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
