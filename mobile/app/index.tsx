import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { ONBOARDING_SEEN_KEY } from './onboarding';

// No visible UI — just routes to the right place once session restore
// (and the one-time onboarding check) finish.
export default function EntryRedirect() {
  const { authReady, isLoggedIn } = useApp();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY)
      .then(value => setHasSeenOnboarding(value === 'true'))
      .finally(() => setOnboardingChecked(true));
  }, []);

  useEffect(() => {
    if (!authReady || !onboardingChecked) return;
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else if (!hasSeenOnboarding) {
      router.replace('/onboarding');
    } else {
      router.replace('/login');
    }
  }, [authReady, isLoggedIn, onboardingChecked, hasSeenOnboarding]);

  return null;
}
