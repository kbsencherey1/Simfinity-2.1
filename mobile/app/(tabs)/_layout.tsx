import { Tabs } from 'expo-router';
import { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { COLORS } from '../../components/styles';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11L12 4L21 11V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V11Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ExploreIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={2.5} stroke={color} strokeWidth={1.5} />
      <Path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function EsimIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3H15L19 7V21H5V3H7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Rect x={8} y={11} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={13} y={11} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={8} y={15.5} width={3} height={3} rx={0.5} fill={color} />
      <Rect x={13} y={15.5} width={3} height={3} rx={0.5} fill={color} />
    </Svg>
  );
}

function AccountIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5 20C5 16.69 8.13 14 12 14C15.87 14 19 16.69 19 20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type IconComponent = React.ComponentType<{ color: string }>;

function AnimatedTabIcon({ focused, Icon }: { focused: boolean; Icon: IconComponent }) {
  const scale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 180,
      friction: 7,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon color={focused ? COLORS.gold : COLORS.textMuted} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneContainerStyle: { backgroundColor: 'transparent' },
          tabBarStyle: {
            backgroundColor: 'rgba(8,8,8,0.97)',
            borderTopColor: 'rgba(77,71,50,0.3)',
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
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
            tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} Icon={HomeIcon} />,
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} Icon={ExploreIcon} />,
          }}
        />
        <Tabs.Screen
          name="my-esims"
          options={{
            title: 'My eSIMs',
            tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} Icon={EsimIcon} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} Icon={AccountIcon} />,
          }}
        />
      </Tabs>
    </View>
  );
}
