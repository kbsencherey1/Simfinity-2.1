import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../components/styles';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    plans: '🌍',
    esims: '📶',
    account: '👤',
  };
  return (
    <View style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
      <Text style={tabStyles.emoji}>{icons[name] ?? '●'}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  iconFocused: {},
  emoji: { fontSize: 20 },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(19,19,19,0.97)',
          borderTopColor: 'rgba(77,71,50,0.3)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name="plans" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="my-esims"
        options={{
          title: 'My eSIMs',
          tabBarIcon: ({ focused }) => <TabIcon name="esims" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon name="account" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
