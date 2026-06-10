import { useAuth } from '@/lib/auth';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Redirect, router } from 'expo-router';
import { Check, CheckCircle, Leaf, Phone, Stethoscope, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import DivisionSelect from '@/components/division-select';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RegisterScreen() {
  const { isAuthenticated } = useAuth();
  const [role, setRole] = useState<'parent' | 'health_worker' | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  const parentScale = useSharedValue(1);
  const workerScale = useSharedValue(1);
  const btnScale = useSharedValue(1);

  const parentStyle = useAnimatedStyle(() => ({ transform: [{ scale: parentScale.value }] }));
  const workerStyle = useAnimatedStyle(() => ({ transform: [{ scale: workerScale.value }] }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const canSubmit = !!role && !!fullName && !!phone && agreed;

  const selectRole = (r: 'parent' | 'health_worker') => {
    const sv = r === 'parent' ? parentScale : workerScale;
    sv.value = withSpring(0.94, { damping: 12 }, () => {
      sv.value = withSpring(1, { damping: 10 });
    });
    setRole(r);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    btnScale.value = withSpring(0.95, { damping: 15 }, () => {
      btnScale.value = withSpring(1, { damping: 12 });
    });
    router.push('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-hero" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Hero ── */}
        <View className="bg-brand-hero h-[220px] px-6 pt-6 pb-8 overflow-hidden">
          <View
            className="absolute rounded-full"
            style={{ width: 220, height: 220, top: -80, right: -70, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 110 }}
          />
          <View
            className="absolute rounded-full"
            style={{ width: 130, height: 130, bottom: -20, left: -30, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 65 }}
          />

          <Animated.View
            entering={FadeInDown.duration(500).delay(50)}
            className="flex-row items-center gap-2.5 mb-5">
            <View
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf color="white" size={16} strokeWidth={1.8} />
            </View>
            <Text className="text-white text-[18px] font-bold">ShishuCare</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(150)}>
            <Text className="text-white text-[27px] font-extrabold mb-2">
              Create your account
            </Text>
            <Text className="text-white/70 text-[14px] leading-5">
              Join parents and health workers{'\n'}on their child care journey.
            </Text>
          </Animated.View>
        </View>

        {/* ── Form card ── */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100).springify().damping(18)}
          className="bg-background px-5 pt-7 pb-12"
          style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24 }}>

          <View className="w-10 h-1 rounded-full bg-border self-center mb-7" />

          {/* Role selection */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text className="text-foreground text-[15px] font-bold mb-3">I am a...</Text>
          </Animated.View>

          <View className="flex-row gap-3 mb-6">
            {/* Parent card */}
            <AnimatedPressable
              entering={FadeInRight.duration(450).delay(350)}
              style={[
                parentStyle,
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 22,
                  paddingHorizontal: 12,
                  borderRadius: 24,
                  borderWidth: 2,
                  gap: 12,
                  borderColor: role === 'parent' ? '#0A0A0A' : '#E5E5E5',
                  backgroundColor: role === 'parent' ? '#F5F5F5' : '#FFFFFF',
                  shadowColor: role === 'parent' ? '#0A0A0A' : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: role === 'parent' ? 0.18 : 0.04,
                  shadowRadius: 10,
                  elevation: role === 'parent' ? 5 : 1,
                },
              ]}
              onPress={() => selectRole('parent')}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: role === 'parent' ? '#0A0A0A' : '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <User color={role === 'parent' ? '#fff' : '#6B7280'} size={26} strokeWidth={1.8} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: role === 'parent' ? '#0A0A0A' : '#6B7280' }}>
                Parent
              </Text>
              {role === 'parent' && (
                <Animated.View entering={ZoomIn.duration(250)} style={{ position: 'absolute', top: 10, right: 10 }}>
                  <CheckCircle color="#0A0A0A" size={18} fill="#0A0A0A" />
                </Animated.View>
              )}
            </AnimatedPressable>

            {/* Health Worker card */}
            <AnimatedPressable
              entering={FadeInRight.duration(450).delay(420)}
              style={[
                workerStyle,
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 22,
                  paddingHorizontal: 12,
                  borderRadius: 24,
                  borderWidth: 2,
                  gap: 12,
                  borderColor: role === 'health_worker' ? '#0A0A0A' : '#E5E5E5',
                  backgroundColor: role === 'health_worker' ? '#F5F5F5' : '#FFFFFF',
                  shadowColor: role === 'health_worker' ? '#0A0A0A' : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: role === 'health_worker' ? 0.18 : 0.04,
                  shadowRadius: 10,
                  elevation: role === 'health_worker' ? 5 : 1,
                },
              ]}
              onPress={() => selectRole('health_worker')}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: role === 'health_worker' ? '#0A0A0A' : '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Stethoscope color={role === 'health_worker' ? '#fff' : '#6B7280'} size={26} strokeWidth={1.8} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: role === 'health_worker' ? '#0A0A0A' : '#6B7280' }}>
                Health Worker
              </Text>
              {role === 'health_worker' && (
                <Animated.View entering={ZoomIn.duration(250)} style={{ position: 'absolute', top: 10, right: 10 }}>
                  <CheckCircle color="#0A0A0A" size={18} fill="#0A0A0A" />
                </Animated.View>
              )}
            </AnimatedPressable>
          </View>

          {/* Account details */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(480)}
            className="bg-card border border-border rounded-3xl p-5 gap-4 mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}>
            <Text className="text-foreground text-[16px] font-bold">Account Details</Text>

            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">Full Name</Text>
              <TextInput
                style={{ height: 52, borderWidth: 1, borderColor: '#D4D4D4', borderRadius: 16, paddingHorizontal: 16, fontSize: 15, backgroundColor: '#FAFCFB', color: '#111827' }}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">Phone Number</Text>
              <View style={{ position: 'relative' }}>
                <View style={{ position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                  <Icon as={Phone} color="#0A0A0A" size={16} />
                </View>
                <Input
                  className="h-13 pl-11 rounded-2xl border-brand-input-border bg-brand-input-bg text-sm"
                  placeholder="017XX XXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">Location</Text>
              <DivisionSelect />
            </View>
          </Animated.View>

          {/* Terms */}
          <Animated.View entering={FadeInDown.duration(400).delay(540)}>
            <Pressable className="flex-row items-start gap-3 mb-6" onPress={() => setAgreed(!agreed)}>
              <View
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: agreed ? '#0A0A0A' : '#D4D4D4',
                  backgroundColor: agreed ? '#0A0A0A' : '#FAFCFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                {agreed && <Check color="white" size={12} strokeWidth={3} />}
              </View>
              <Text className="text-muted-foreground flex-1 text-[13px] leading-5">
                I agree to the{' '}
                <Text className="text-primary font-semibold">Privacy Policy</Text> and{' '}
                <Text className="text-primary font-semibold">Terms of Service</Text>, and consent to
                data collection for health guidance.
              </Text>
            </Pressable>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.duration(400).delay(590)}>
            <AnimatedPressable
              style={[
                btnStyle,
                {
                  height: 56,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  backgroundColor: canSubmit ? '#0A0A0A' : 'rgba(31,122,83,0.35)',
                  shadowColor: '#0A0A0A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: canSubmit ? 0.35 : 0,
                  shadowRadius: 16,
                  elevation: canSubmit ? 8 : 0,
                },
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}>
              <Text className="text-white text-[16px] font-bold">Create Account</Text>
            </AnimatedPressable>
          </Animated.View>

          <View className="items-center">
            <Text className="text-muted-foreground text-[14px]">
              Already have an account?{' '}
              <Text className="text-primary font-bold" onPress={() => router.replace('/login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
