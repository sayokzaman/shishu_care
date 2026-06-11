import { DatePicker } from '@/components/ui/date-picker';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { LocationSelect } from '@/components/location-select';
import { useAuth } from '@/lib/auth';
import { Redirect, router } from 'expo-router';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Phone,
  Stethoscope,
  Type,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FormState = {
  role: 'parent' | 'health_worker' | null;
  fullNameBn: string;
  fullNameEn: string;
  phone: string;
  password: string;
  dateOfBirth: Date | null;
  divisionId: string;
  districtId: string;
  upazillaId: string;
  agreed: boolean;
};

export default function RegisterScreen() {
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState<FormState>({
    role: null,
    fullNameBn: '',
    fullNameEn: '',
    phone: '',
    password: '',
    dateOfBirth: null,
    divisionId: '',
    districtId: '',
    upazillaId: '',
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentScale = useSharedValue(1);
  const workerScale = useSharedValue(1);
  const btnScale = useSharedValue(1);

  const parentStyle = useAnimatedStyle(() => ({ transform: [{ scale: parentScale.value }] }));
  const workerStyle = useAnimatedStyle(() => ({ transform: [{ scale: workerScale.value }] }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const set = (key: keyof FormState) => (val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const selectRole = (r: 'parent' | 'health_worker') => {
    const sv = r === 'parent' ? parentScale : workerScale;
    sv.value = withSpring(0.94, { damping: 12 }, () => {
      sv.value = withSpring(1, { damping: 10 });
    });
    set('role')(r);
  };

  const passwordOk = form.password.length === 0 || form.password.length >= 8;

  const canSubmit =
    !!form.role &&
    !!form.fullNameBn.trim() &&
    !!form.phone.trim() &&
    form.password.length >= 8 &&
    !!form.divisionId &&
    !!form.districtId &&
    !!form.upazillaId &&
    form.agreed &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    btnScale.value = withSpring(0.95, { damping: 15 }, () => {
      btnScale.value = withSpring(1, { damping: 12 });
    });
    setLoading(true);
    setError(null);
    try {
      await register({
        phone: form.phone.trim(),
        fullNameBn: form.fullNameBn.trim(),
        fullNameEn: form.fullNameEn.trim() || undefined,
        password: form.password,
        role: form.role!,
        divisionId: parseInt(form.divisionId),
        districtId: parseInt(form.districtId),
        upazillaId: parseInt(form.upazillaId),
        dateOfBirth: form.dateOfBirth ?? undefined,
      });
      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-hero" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Hero ── */}
        <View className="bg-brand-hero h-[200px] px-6 pt-6 pb-8 overflow-hidden">
          <View
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              top: -80,
              right: -70,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 110,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 130,
              height: 130,
              bottom: -20,
              left: -30,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 65,
            }}
          />

          <Animated.View
            entering={FadeInDown.duration(500).delay(50)}
            className="flex-row items-center gap-2.5 mb-5">
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Leaf color="white" size={16} strokeWidth={1.8} />
            </View>
            <Text className="text-white text-[18px] font-bold">ShishuCare</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(150)}>
            <Text className="text-white text-[27px] font-extrabold mb-1">
              Create your account
            </Text>
            <Text className="text-white/70 text-[14px] leading-5">
              Join parents and health workers on their child care journey.
            </Text>
          </Animated.View>
        </View>

        {/* ── Form card ── */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100).springify().damping(18)}
          className="bg-background px-5 pt-7 pb-12"
          style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24 }}>

          <View className="w-10 h-1 rounded-full bg-border self-center mb-7" />

          {/* Error banner */}
          {error && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 mb-5 flex-row items-start gap-3">
              <AlertTriangle color="#EF4444" size={16} strokeWidth={2} />
              <Text className="text-red-600 text-[13px] flex-1 leading-5">{error}</Text>
            </Animated.View>
          )}

          {/* ── Role selection ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(280)}>
            <Text className="text-foreground text-[15px] font-bold mb-3">I am a...</Text>
          </Animated.View>

          <View className="flex-row gap-3 mb-6">
            <AnimatedPressable
              entering={FadeInRight.duration(450).delay(340)}
              style={[
                parentStyle,
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 20,
                  paddingHorizontal: 12,
                  borderRadius: 22,
                  borderWidth: 2,
                  gap: 10,
                  borderColor: form.role === 'parent' ? '#1DA470' : '#E5E5E5',
                  backgroundColor: form.role === 'parent' ? '#F5F5F5' : '#FFFFFF',
                  shadowColor: '#0A0A0A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: form.role === 'parent' ? 0.16 : 0.04,
                  shadowRadius: 10,
                  elevation: form.role === 'parent' ? 4 : 1,
                },
              ]}
              onPress={() => selectRole('parent')}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: form.role === 'parent' ? '#B1F0CE' : '#C7E7FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <User
                  color={form.role === 'parent' ? '#0F5238' : '#064C6B'}
                  size={24}
                  strokeWidth={1.8}
                />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: form.role === 'parent' ? '#0A0A0A' : '#6B7280',
                }}>
                Parent
              </Text>
              {form.role === 'parent' && (
                <Animated.View
                  entering={ZoomIn.duration(220)}
                  style={{ position: 'absolute', top: 10, right: 10 }}>
                  <CheckCircle color="#0F5238" size={17} fill="#B1F0CE" />
                </Animated.View>
              )}
            </AnimatedPressable>

            <AnimatedPressable
              entering={FadeInRight.duration(450).delay(400)}
              style={[
                workerStyle,
                {
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 20,
                  paddingHorizontal: 12,
                  borderRadius: 22,
                  borderWidth: 2,
                  gap: 10,
                  borderColor: form.role === 'health_worker' ? '#1DA470' : '#E5E5E5',
                  backgroundColor: form.role === 'health_worker' ? '#F5F5F5' : '#FFFFFF',
                  shadowColor: '#0A0A0A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: form.role === 'health_worker' ? 0.16 : 0.04,
                  shadowRadius: 10,
                  elevation: form.role === 'health_worker' ? 4 : 1,
                },
              ]}
              onPress={() => selectRole('health_worker')}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: form.role === 'health_worker' ? '#B1F0CE' : '#C7E7FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Stethoscope
                  color={form.role === 'health_worker' ? '#0F5238' : '#064C6B'}
                  size={24}
                  strokeWidth={1.8}
                />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: form.role === 'health_worker' ? '#0A0A0A' : '#6B7280',
                }}>
                Health Worker
              </Text>
              {form.role === 'health_worker' && (
                <Animated.View
                  entering={ZoomIn.duration(220)}
                  style={{ position: 'absolute', top: 10, right: 10 }}>
                  <CheckCircle color="#0F5238" size={17} fill="#B1F0CE" />
                </Animated.View>
              )}
            </AnimatedPressable>
          </View>

          {/* ── Personal Details ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(450)}
            className="bg-card border border-border rounded-3xl p-5 gap-4 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}>
            <Text className="text-foreground text-[15px] font-bold">Personal Details</Text>

            {/* Full Name (Bengali) */}
            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">
                Full Name (Bengali) <Text className="text-destructive">*</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: 10,
                  }}>
                  <Icon as={Type} color="#9CA3AF" size={16} />
                </View>
                <Input
                  className="h-14 pl-11 rounded-2xl border-brand-input-border bg-brand-input-bg text-[15px]"
                  placeholder="আপনার পুরো নাম লিখুন"
                  placeholderTextColor="#9CA3AF"
                  value={form.fullNameBn}
                  onChangeText={set('fullNameBn')}
                />
              </View>
            </View>

            {/* Full Name (English) */}
            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">
                Full Name (English){' '}
                <Text className="text-muted-foreground text-[12px] font-normal">optional</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: 10,
                  }}>
                  <Icon as={Type} color="#9CA3AF" size={16} />
                </View>
                <Input
                  className="h-14 pl-11 rounded-2xl border-brand-input-border bg-brand-input-bg text-[15px]"
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  value={form.fullNameEn}
                  onChangeText={set('fullNameEn')}
                />
              </View>
            </View>

            {/* Phone */}
            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">
                Phone Number <Text className="text-destructive">*</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: 10,
                  }}>
                  <Icon as={Phone} color="#9CA3AF" size={16} />
                </View>
                <Input
                  className="h-14 pl-11 rounded-2xl border-brand-input-border bg-brand-input-bg text-[15px]"
                  placeholder="017XX XXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={set('phone')}
                />
              </View>
            </View>

            {/* Password */}
            <View className="gap-1.5">
              <Text className="text-foreground text-[13px] font-semibold">
                Password <Text className="text-destructive">*</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: 10,
                  }}>
                  <Icon as={Lock} color="#9CA3AF" size={16} />
                </View>
                <Input
                  className="h-14 pl-11 pr-14 rounded-2xl border-brand-input-border bg-brand-input-bg text-[15px]"
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={set('password')}
                />
                <Pressable
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() => setShowPassword((p) => !p)}>
                  <Icon
                    as={showPassword ? EyeOff : Eye}
                    color="#9CA3AF"
                    size={17}
                  />
                </Pressable>
              </View>
              {!passwordOk && (
                <Text className="text-destructive text-[12px] mt-0.5">
                  Password must be at least 8 characters
                </Text>
              )}
            </View>
          </Animated.View>

          {/* ── Date of Birth ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(490)}
            className="bg-card border border-border rounded-3xl p-5 gap-3 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}>
            <Text className="text-foreground text-[15px] font-bold">Date of Birth</Text>
            <Text className="text-muted-foreground text-[13px] -mt-1">optional</Text>
            <DatePicker
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              placeholder="Select your date of birth"
            />
          </Animated.View>

          {/* ── Location ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(530)}
            className="bg-card border border-border rounded-3xl p-5 gap-4 mb-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}>
            <Text className="text-foreground text-[15px] font-bold">Location</Text>
            <LocationSelect
              divisionId={form.divisionId}
              districtId={form.districtId}
              upazillaId={form.upazillaId}
              onDivisionChange={set('divisionId')}
              onDistrictChange={set('districtId')}
              onUpazillaChange={set('upazillaId')}
            />
          </Animated.View>

          {/* ── Terms ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(570)}>
            <Pressable
              className="flex-row items-start gap-3 mb-6"
              onPress={() => set('agreed')(!form.agreed)}>
              <View
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: form.agreed ? '#0A0A0A' : '#D4D4D4',
                  backgroundColor: form.agreed ? '#0A0A0A' : '#FAFCFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                {form.agreed && <Check color="white" size={12} strokeWidth={3} />}
              </View>
              <Text className="text-muted-foreground flex-1 text-[13px] leading-5">
                I agree to the{' '}
                <Text className="text-primary font-semibold">Privacy Policy</Text> and{' '}
                <Text className="text-primary font-semibold">Terms of Service</Text>, and
                consent to data collection for health guidance.
              </Text>
            </Pressable>
          </Animated.View>

          {/* ── Submit ── */}
          <Animated.View entering={FadeInDown.duration(400).delay(610)}>
            <AnimatedPressable
              style={[
                btnStyle,
                {
                  height: 56,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  backgroundColor: canSubmit ? '#0A0A0A' : 'rgba(10,10,10,0.25)',
                  shadowColor: '#0A0A0A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: canSubmit ? 0.35 : 0,
                  shadowRadius: 16,
                  elevation: canSubmit ? 8 : 0,
                },
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[16px] font-bold tracking-wide">
                  Create Account
                </Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          <View className="items-center">
            <Text className="text-muted-foreground text-[14px]">
              Already have an account?{' '}
              <Text
                className="text-primary font-bold"
                onPress={() => router.replace('/login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
