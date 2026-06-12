import { useAuth } from '@/lib/auth';
import { Text } from '@/components/ui/text';
import * as Avatar from '@rn-primitives/avatar';
import * as Switch from '@rn-primitives/switch';
import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Shield,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Uniwind } from 'uniwind';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AndroidBlurScreenWrapper } from '@/app/(tabs)/_layout';
import Header from '@/components/header'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SETTINGS_ITEMS = [
  { id: '1', Icon: Bell, label: 'Notifications', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '2', Icon: Globe, label: 'Language', color: '#0A0A0A', bg: '#F5F5F5', badge: 'English' },
  { id: '3', Icon: Moon, label: 'Dark Mode', color: '#7C3AED', bg: '#F5F3FF', isThemeToggle: true },
  { id: '4', Icon: Shield, label: 'Privacy & Data', color: '#F59E0B', bg: '#FFF7ED' },
  { id: '5', Icon: HelpCircle, label: 'Help & Support', color: '#6B7280', bg: '#F9FAFB' },
  { id: '6', Icon: Star, label: 'Rate ShishuCare', color: '#EF4444', bg: '#FEF2F2' },
];

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(Uniwind.currentTheme === 'dark');

  const logoutScale = useSharedValue(1);
  const logoutStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoutScale.value }] }));

  const displayName = user?.fullNameEn ?? user?.fullNameBn ?? 'Parent';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    logoutScale.value = withSpring(0.95, { damping: 12 }, () => {
      logoutScale.value = withSpring(1, { damping: 10 });
    });
    await logout();
    router.replace('/login');
  };

  const toggleTheme = () => {
    const next: 'light' | 'dark' = isDark ? 'light' : 'dark';
    Uniwind.setTheme(next);
    setIsDark(!isDark);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}>
        <Header title="Profile" secondaryText=''/>
        {/* ── Profile header ── */}
        <Animated.View
          entering={FadeInDown.duration(480).delay(50).springify()}
          className="bg-brand-hero mx-4 mt-4 overflow-hidden rounded-3xl p-5"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 22,
            elevation: 14,
          }}>
          <View
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: 90,
              top: -55,
              right: -55,
              backgroundColor: 'rgba(255,255,255,0.07)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 90,
              height: 90,
              borderRadius: 45,
              bottom: -15,
              left: 45,
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <Avatar.Root style={{ width: 64, height: 64 }} alt={displayName}>
              <Avatar.Image
                source={{ uri: user?.avatarUrl ?? undefined }}
                style={{ width: 64, height: 64, borderRadius: 20 }}
              />
              <Avatar.Fallback
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: 'rgba(245,245,245,0.95)',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#0A0A0A', fontSize: 22, fontWeight: '800' }}>
                  {initials}
                </Text>
              </Avatar.Fallback>
            </Avatar.Root>

            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 19, fontWeight: '800' }}>{displayName}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>
                {user?.phone ?? '+880 17XX XXXXXX'}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 11,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}>
                  {user?.role ?? 'Parent'}
                </Text>
              </View>
            </View>

            <Pressable
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Settings color="white" size={17} />
            </Pressable>
          </View>

          <Pressable
            style={{
              backgroundColor: 'rgba(255,255,255,0.13)',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
            }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' }}>
                Child Profile
              </Text>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '700', marginTop: 2 }}>
                Aayan · 8 Months Old
              </Text>
            </View>
            <ChevronRight color="rgba(255,255,255,0.65)" size={16} />
          </Pressable>
        </Animated.View>

        {/* ── Stats ── */}
        <View className="mt-4 flex-row gap-3 px-4">
          {[
            { label: 'Days active', value: '29' },
            { label: 'Care logs', value: '84' },
            { label: 'AI queries', value: '12' },
          ].map((s, i) => (
            <Animated.View
              key={s.label}
              entering={FadeInDown.duration(380)
                .delay(150 + i * 70)
                .springify()}
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E5E5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}>
              <Text style={{ color: '#111827', fontSize: 20, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 3 }}>
                {s.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* ── Settings ── */}
        <Animated.View entering={FadeInDown.duration(430).delay(310)} className="mt-5 px-4">
          <Text className="text-foreground mb-3 text-[17px] font-extrabold">Settings</Text>
          <View
            className="bg-card border-border overflow-hidden rounded-2xl border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}>
            {SETTINGS_ITEMS.map((item, idx) => {
              const ItemIcon = item.Icon;
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.duration(350).delay(330 + idx * 50)}>
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 14,
                      borderBottomWidth: idx < SETTINGS_ITEMS.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}
                    onPress={item.isThemeToggle ? toggleTheme : undefined}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: item.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <ItemIcon color={item.color} size={18} />
                    </View>
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' }}>
                      {item.label}
                    </Text>

                    {item.isThemeToggle ? (
                      <Switch.Root
                        checked={isDark}
                        onCheckedChange={toggleTheme}
                        style={{
                          width: 46,
                          height: 26,
                          borderRadius: 13,
                          padding: 3,
                          backgroundColor: isDark ? '#0A0A0A' : '#D1D5DB',
                          justifyContent: 'center',
                        }}>
                        <Switch.Thumb
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: 'white',
                            marginLeft: isDark ? 20 : 0,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                            elevation: 2,
                          }}
                        />
                      </Switch.Root>
                    ) : item.badge ? (
                      <Text style={{ color: '#9CA3AF', fontSize: 13, marginRight: 4 }}>
                        {item.badge}
                      </Text>
                    ) : (
                      <ChevronRight color="#D1D5DB" size={16} />
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Sign out ── */}
        <Animated.View entering={FadeInDown.duration(380).delay(480)} className="mt-4 px-4">
          <AnimatedPressable
            style={[
              logoutStyle,
              {
                height: 52,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 10,
                borderWidth: 1,
                borderColor: '#FECACA',
                backgroundColor: '#FEF2F2',
              },
            ]}
            onPress={handleLogout}>
            <LogOut color="#B91C1C" size={18} />
            <Text style={{ color: '#B91C1C', fontSize: 15, fontWeight: '700' }}>Sign Out</Text>
          </AnimatedPressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(530)} className="mt-5 items-center">
          <Text className="text-muted-foreground text-[12px]">ShishuCare v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
