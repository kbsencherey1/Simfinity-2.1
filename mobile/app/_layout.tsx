import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppProvider } from '../context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouristBackground, TouristBackgroundProvider } from '../components/TouristBackground';
import { useNotificationListener } from '../hooks/usePushNotifications';
import { ReturnSplash } from '../components/ReturnSplash';

// react-navigation's bottom-tabs stacks inactive tab scenes behind the focused one via
// zIndex rather than unmounting them, relying on react-native-screens to actually hide
// them (display:none). react-native-screens defaults to disabled on web, so without this
// call inactive tabs stay visibly rendered and bleed through the focused tab's transparent
// background (needed so the shared TouristBackground shows through every tab).
enableScreens();

// react-navigation's default (light) theme background — rgb(242,242,242) — paints
// behind every screen on web, and Stack's own contentStyle:'transparent' doesn't
// override it there (native platforms are unaffected, since screens are real UIKit/
// Android views, not DOM elements layered under a themed container). A transparent
// dark theme lets the TouristBackground photo underneath show through correctly.
const transparentTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent' },
};

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
            <ThemeProvider value={transparentTheme}>
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
                <Stack.Screen name="privacy-policy" />
              </Stack>
            </ThemeProvider>

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
