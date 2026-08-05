import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Pull the LAN IP from whichever field expo-constants exposes for this SDK version.
// hostUri looks like "192.168.1.10:8081" — we take only the IP part.
const rawHostUri: string | undefined =
  Constants.expoConfig?.hostUri ??
  (Constants as any).manifest?.debuggerHost ??
  (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
  (Constants as any).manifest?.packagerOpts?.host ??
  (Constants as any).manifest2?.extra?.expoGo?.hostUri;

const hostUri = rawHostUri ? rawHostUri.replace(/^https?:\/\//, '') : undefined;
const devHost = hostUri
  ? hostUri.split(':')[0]
  : Platform.OS === 'android'
  ? '10.0.2.2'
  : 'localhost';

// Standalone (non-dev-client) builds don't get a Metro hostUri, so they can't
// infer the dev machine's address the way __DEV__ builds do. Point at the
// hosted Render backend so an installed APK works over any network, not just
// this machine's LAN.
export const API_BASE = __DEV__
  ? `http://${devHost}:3000`
  : 'https://simfinity-backend-a06f.onrender.com';
