import { useAuth } from '@/lib/auth';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Redirect, router } from 'expo-router';
import { AlertTriangle, Eye, EyeOff, Lock, Phone, Leaf } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const btnScale = useSharedValue(1);
  const orb1 = useSharedValue(1);
  const orb2 = useSharedValue(1);
  const orb3 = useSharedValue(0);

  useEffect(() => {
    orb1.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orb2.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    orb3.value = withRepeat(
      withSequence(withTiming(0.06, { duration: 1800 }), withTiming(0.12, { duration: 1800 })),
      -1,
      false
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({ transform: [{ scale: orb1.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ scale: orb2.value }] }));
  const orb3Style = useAnimatedStyle(() => ({ opacity: orb3.value }));
  const btnAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleLogin = async () => {
    setError(null);
    if (!phone || !password) {
      setError('Please enter your phone number and password.');
      return;
    }
    btnScale.value = withSpring(0.95, { damping: 15 }, () => {
      btnScale.value = withSpring(1, { damping: 12 });
    });
    setLoading(true);
    try {
      await login(phone, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-brand-hero flex-1" edges={['top']}>
      <View className="absolute inset-0 z-0 min-h-screen">
        {/* ── Hero ── */}
        <View className="bg-brand-hero items-center justify-center overflow-hidden px-6 py-20 pb-10">
          {/* Animated ambient orbs */}
          <Animated.View
            style={[
              orb1Style,
              {
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: 110,
                top: -80,
                right: -70,
                backgroundColor: 'rgba(255,255,255,0.07)',
              },
            ]}
          />
          <Animated.View
            style={[
              orb2Style,
              {
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: 75,
                bottom: -30,
                left: -40,
                backgroundColor: 'rgba(255,255,255,0.06)',
              },
            ]}
          />
          <Animated.View
            style={[
              orb3Style,
              {
                position: 'absolute',
                width: 90,
                height: 90,
                borderRadius: 45,
                top: 20,
                left: 30,
                backgroundColor: 'white',
              },
            ]}
          />

          {/* Logo mark */}
          <Animated.View
            entering={FadeIn.duration(700).delay(100)}
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <Leaf color="white" size={36} strokeWidth={1.5} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(250)}>
            <Text className="mb-2 text-center text-[33px] font-extrabold tracking-tight text-white">
              ShishuCare
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(500).delay(350)}>
            <Text className="text-center text-[14px] leading-6 font-medium text-white/70">
              Your compassionate guide for{'\n'}every parenting journey
            </Text>
          </Animated.View>
        </View>

        {/* ── Form card ── */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(150).springify().damping(18)}
          className="bg-background h-full w-full flex-1 rounded-t-3xl px-5 pt-8 pb-10">
          {/* Pill handle */}
          <View className="bg-border mb-7 h-1 w-10 self-center rounded-full" />

          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <Text className="text-foreground mb-1 text-[28px] font-extrabold">Welcome back</Text>
            <Text className="text-muted-foreground mb-7 text-[14px]">
              Sign in to continue caring for your child
            </Text>
          </Animated.View>

          {/* Error banner */}
          {error && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="mb-5 flex-row items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle color="#EF4444" size={16} strokeWidth={2} />
              <Text className="flex-1 text-[13px] leading-5 text-red-600">{error}</Text>
            </Animated.View>
          )}

          {/* Phone */}
          <Animated.View entering={FadeInDown.duration(400).delay(430)} className="mb-4">
            <Text className="text-foreground mb-2 text-[13px] font-semibold">Phone Number</Text>
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  zIndex: 10,
                }}>
                <Icon as={Phone} color="#0A0A0A" size={17} />
              </View>
              <Input
                className="border-brand-input-border bg-brand-input-bg h-14 rounded-2xl pl-12 text-sm"
                placeholder="017XX XXXXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.duration(400).delay(490)} className="mb-7">
            <Text className="text-foreground mb-2 text-[13px] font-semibold">Password</Text>
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  zIndex: 10,
                }}>
                <Icon as={Lock} color="#0A0A0A" size={17} />
              </View>
              <Input
                className="border-brand-input-border bg-brand-input-bg h-14 rounded-2xl pr-14 pl-12 text-sm"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
                onPress={() => setShowPassword(!showPassword)}>
                <Icon as={showPassword ? EyeOff : Eye} color="#9CA3AF" size={18} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Sign in CTA */}
          <Animated.View entering={FadeInDown.duration(400).delay(550)}>
            <AnimatedPressable
              style={[
                btnAnimStyle,
                {
                  height: 56,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  backgroundColor: '#0A0A0A',
                  shadowColor: '#0A0A0A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: loading ? 0.15 : 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                  opacity: loading ? 0.75 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[16px] font-bold tracking-wide text-white">Sign In</Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          {/* Language toggle */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(600)}
            className="mb-7 flex-row justify-center gap-2">
            <Pressable
              className={`rounded-full px-4 py-1.5 ${lang === 'en' ? 'bg-brand-primary-light' : 'bg-muted'}`}
              onPress={() => setLang('en')}>
              <Text
                className={`text-[13px] font-semibold ${lang === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>
                English
              </Text>
            </Pressable>
            <Pressable
              className={`rounded-full px-4 py-1.5 ${lang === 'bn' ? 'bg-brand-primary-light' : 'bg-muted'}`}
              onPress={() => setLang('bn')}>
              <Text
                className={`text-[13px] font-semibold ${lang === 'bn' ? 'text-primary' : 'text-muted-foreground'}`}>
                বাংলা
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(650)} className="items-center">
            <Text className="text-muted-foreground text-[14px]">
              Don&apos;t have an account?{' '}
              <Text className="text-primary font-bold" onPress={() => router.replace('/register')}>
                Create Account
              </Text>
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
