import { StyleSheet, Text, View } from 'react-native';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './store';
import { Splash, Loading, Register, WorkInfo, Login, FarmerDashboard, DealerDashboard } from './pages';
import { SWRConfig } from 'swr';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1B4332',      // Deep Green
    secondary: '#D4A373',    // Wheat/Accent
    background: '#F8F9F8',   // Light Off-white
    surface: '#FFFFFF',
    accent: '#52B788',       // Vibrant Green for highlights
    error: '#BC4749',
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          provider: () => new Map(),
          isVisible: () => true,
          initFocus(callback) {
            let appState = AppState.currentState;

            const onAppStateChange = (nextAppState) => {
              if (
                appState.match(/inactive|background/) &&
                nextAppState === "active"
              ) {
                callback();
              }
              appState = nextAppState;
            };

            const subscription = AppState.addEventListener(
              "change",
              onAppStateChange
            );

            return () => {
              subscription.remove();
            };
          },
        }}
      >
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="loading" component={Loading} />
              <Stack.Screen name="register" component={Register} />
              <Stack.Screen name="workinfo" component={WorkInfo} />
              <Stack.Screen name="login" component={Login} />
              <Stack.Screen name="fdashboard" component={FarmerDashboard} />
              <Stack.Screen name="ddashboard" component={DealerDashboard} />
              <Stack.Screen name="switch" component={Splash} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SWRConfig>
    </Provider>
  );
}
