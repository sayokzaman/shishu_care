import { useAuth } from '@/lib/auth';
import { Redirect, Tabs } from 'expo-router';
import { Activity, Home, TrendingUp, UserCircle } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Animated, {
  useSharedValue, withSpring, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'home/index',     label: 'Home',     Icon: Home },
  { name: 'track/index',    label: 'Track',    Icon: Activity },
  { name: 'insights/index', label: 'Insights', Icon: TrendingUp },
  { name: 'profile/index',  label: 'Profile',  Icon: UserCircle },
] as const;

function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      position: 'absolute',
      bottom: Math.max(insets.bottom, 10) + 6,
      left: 16, right: 16,
      flexDirection: 'row',
      backgroundColor: '#0A0A0A',
      borderRadius: 26,
      height: 68,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 18,
      paddingHorizontal: 6,
    }}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return <TabButton key={route.key} isFocused={isFocused} Icon={tab.Icon} label={tab.label} onPress={onPress} />;
      })}
    </View>
  );
}

function TabButton({ isFocused, Icon, label, onPress }: { isFocused: boolean; Icon: any; label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const bgAnim = useSharedValue(isFocused ? 1 : 0);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: `rgba(255,255,255,${bgAnim.value * 0.12})`,
  }));
  const handlePress = () => {
    scale.value = withSpring(0.88, { damping: 12 }, () => { scale.value = withSpring(1, { damping: 10 }); });
    bgAnim.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    onPress();
  };
  return (
    <Pressable onPress={handlePress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8 }}>
      <Animated.View style={[iconStyle, { width: 46, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }]}>
        <Icon size={21} color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} strokeWidth={isFocused ? 2.5 : 1.8} />
      </Animated.View>
      <Text style={{ fontSize: 10, fontWeight: isFocused ? '700' : '500', color: isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect href="/login" />;
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home/index"     options={{ title: 'Home' }} />
      <Tabs.Screen name="track/index"    options={{ title: 'Track' }} />
      <Tabs.Screen name="insights/index" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile/index"  options={{ title: 'Profile' }} />
    </Tabs>
  );
}
