import Header from '@/components/header'
import { useAuth } from '@/lib/auth';
import { THEME } from '@/lib/theme';
import { Redirect, Tabs } from 'expo-router';
import { ChartCandlestick, ChartNoAxesCombined, Home, User } from 'lucide-react-native';
import { useUniwind } from 'uniwind';

export default function TabLayout() {
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
        }}>
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            headerShown: true,
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="track/index"
          options={{
            title: 'Tracking',
            tabBarIcon: ({ color, size }) => <ChartNoAxesCombined size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="insights/index"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => <ChartCandlestick size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
