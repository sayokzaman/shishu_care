import React, { createContext, useContext, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Text } from '@/components/ui/text';
import { Redirect, Tabs } from 'expo-router';
import { Activity, Home, TrendingUp, UserCircle } from 'lucide-react-native';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView, BlurTargetView } from 'expo-blur'; 

// 1. FIXED: Changed default value to undefined to perfectly match required types
const BlurTargetContext = createContext<React.RefObject<View | null> | undefined>(undefined);

const TABS = [
  { name: 'home/index', label: 'Home', Icon: Home },
  { name: 'track/index', label: 'Track', Icon: Activity },
  { name: 'insights/index', label: 'Insights', Icon: TrendingUp },
  { name: 'profile/index', label: 'Profile', Icon: UserCircle },
] as const;

function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  // 2. Consume the context safely
  const blurTargetRef = useContext(BlurTargetContext);
  
  return (
    <View
      style={[
        styles.tabBarContainer,
        { bottom: Math.max(insets.bottom, 10) + 6 }
      ]}
    >
      <BlurView
        intensity={50}
        tint="light"
        blurMethod="dimezisBlurViewSdk31Plus"
        // 3. FIXED: Passing undefined instead of null satisfies the TS validation pipeline
        blurTarget={blurTargetRef} 
        style={StyleSheet.absoluteFill}
      />
      
      {/* iOS glass shimmer — top-edge highlight */}
      <View className="absolute inset-x-6 top-0 h-px rounded-full bg-white/25" />
      {/* Subtle inner-bottom shadow for depth */}
      <View className="absolute inset-x-0 bottom-0 h-[1px] bg-white/[4%]" />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            Icon={tab.Icon}
            label={tab.label}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  isFocused,
  Icon,
  label,
  onPress,
}: {
  isFocused: boolean;
  Icon: any;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isFocused ? '#2D6A4F' : 'transparent',
  }));

  const handlePress = () => {
    scale.value = withSpring(
      0.87,
      { damping: 12 },
      () => (scale.value = withSpring(1, { damping: 10 }))
    );
    pillOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) });
    onPress();
  };

  return (
    <Pressable onPress={handlePress} className="flex-1 items-center justify-center gap-[3px] py-2">
      <Animated.View
        style={[
          pillStyle,
          {
            width: '100%',
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <Icon
          size={21}
          color={isFocused ? '#A8E7C5' : '#404943'}
          strokeWidth={isFocused ? 2.5 : 1.8}
        />
        <Text
          className={
            isFocused ? 'text-[#A8E7C5] text-[10px] font-bold' : 'text-[10px] font-bold text-[#404943]'
          }>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function AndroidBlurScreenWrapper({ children }: { children: React.ReactNode }) {
  const blurTargetRef = useContext(BlurTargetContext);
  
  return (
    // 4. FIXED: The native `ref` prop now receives a clean RefObject or undefined
    <BlurTargetView ref={blurTargetRef} style={styles.screenWrapper}>
      {children}
    </BlurTargetView>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  // 5. FIXED: Initializing with `null` here is fine because the generic argument expects it, 
  // but context handles it cleanly as a complete RefObject type downstream.
  const sharedTargetRef = useRef<View | null>(null);

  if (!isAuthenticated) return <Redirect href="/login" />;
  
  return (
    <BlurTargetContext.Provider value={sharedTargetRef}>
      <Tabs 
        tabBar={(props) => <FloatingTabBar {...props} />} 
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { 
            position: 'absolute', 
            borderTopWidth: 0, 
            backgroundColor: 'transparent', 
            elevation: 0,
            left: 0,
            right: 0,
            bottom: 0
          }
        }}
      >
        <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
        <Tabs.Screen name="track/index" options={{ title: 'Track' }} />
        <Tabs.Screen name="insights/index" options={{ title: 'Insights' }} />
        <Tabs.Screen name="profile/index" options={{ title: 'Profile' }} />
      </Tabs>
    </BlurTargetContext.Provider>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FFF', 
  },
  tabBarContainer: {
    position: 'absolute',
    right: 16,
    left: 16,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 32, 
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24, 
  }
});
