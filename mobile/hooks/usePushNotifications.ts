import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, LogBox } from 'react-native';
import { router } from 'expo-router';
import { API_BASE } from '../config';

// Remote push was removed from Expo Go in SDK 53. This suppresses the red
// overlay — the warning is expected and we already guard against it at runtime.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications: Push notifications',
]);

// Remote push notifications were removed from Expo Go in SDK 53.
// Skip registration entirely when running inside Expo Go to avoid the red error overlay.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken(authToken: string): Promise<void> {
  try {
    if (!Device.isDevice) return; // simulators don't get push tokens
    if (isExpoGo) return; // push not supported in Expo Go on Android since SDK 53

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry', {
        name: 'Plan Expiry Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    await fetch(`${API_BASE}/api/user/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch (e) {
    // Push setup is best-effort — don't crash the app
  }
}

export function useNotificationListener() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'my-esims') {
        router.push('/(tabs)/my-esims');
      }
    });

    return () => {
      responseListener.current?.remove();
    };
  }, []);
}
