import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#131313' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="activate-esim" />
          <Stack.Screen name="personal-info" />
          <Stack.Screen name="travel-docs" />
          <Stack.Screen name="refer-friend" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
