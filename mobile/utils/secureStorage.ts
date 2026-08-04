import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation (there's no Keychain/Keystore equivalent
// in a browser) — calling it there throws. On web we fall back to localStorage, which
// isn't hardware-encrypted the way native storage is, but it's the standard practical
// fallback Expo apps use so the same auth code path works on every platform.
export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore — e.g. private browsing mode with storage disabled
    }
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
    return;
  }
  return SecureStore.deleteItemAsync(key);
}
