import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AppProvider } from '../context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouristBackground, TouristBackgroundProvider } from '../components/TouristBackground';
import { useNotificationListener } from '../hooks/usePushNotifications';
import { ReturnSplash } from '../components/ReturnSplash';

function NotificationSetup() {
  useNotificationListener();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <TouristBackgroundProvider>
          <View style={styles.root}>
            <NotificationSetup />
            <TouristBackground />

            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="activate-esim" />
              <Stack.Screen name="personal-info" />
              <Stack.Screen name="travel-docs" />
              <Stack.Screen name="refer-friend" />
              <Stack.Screen name="gift-esim" />
              <Stack.Screen name="verify-email" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="reset-password" />
            </Stack>

            <ReturnSplash />
          </View>
        </TouristBackgroundProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050505',
  },
});
