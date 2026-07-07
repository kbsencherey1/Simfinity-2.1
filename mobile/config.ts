import Constants from 'expo-constants';

// Pull the LAN IP from whichever field expo-constants exposes for this SDK version.
// hostUri looks like "192.168.1.10:8081" — we take only the IP part.
const hostUri: string | undefined =
  Constants.expoConfig?.hostUri ??
  (Constants as any).manifest?.debuggerHost ??
  (Constants as any).manifest2?.extra?.expoClient?.hostUri;

const devHost = hostUri ? hostUri.split(':')[0] : '10.0.2.2'; // 10.0.2.2 = Android emulator loopback

export const API_BASE = __DEV__
  ? `http://${devHost}:3000`
  : 'https://api.simfinity.com'; // swap for real production URL when deploying
