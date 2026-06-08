import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Redirect, router } from 'expo-router';
import { ChevronDown, Menu, Phone, Stethoscope, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DivisionSelect from '@/components/division-select';
import { Input } from '@/components/ui/input';

export default function RegisterScreen() {
  const { isAuthenticated } = useAuth();
  const [role, setRole] = useState<'parent' | 'health_worker' | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [data, setData] = useState({
    fullName: '',
    phone: '',
    division: '',
    district: '',
    upazila: '',
    role: '',
    agreedToTerms: false,
  });

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View className="bg-card border-border flex-row items-center justify-between border-b px-5 py-3.5">
          <View className="flex-row items-center gap-2.5">
            <Icon as={Menu} color="#1A6B47" size={22} strokeWidth={2} />
            <Text className="text-primary text-xl font-bold">ShishuCare</Text>
          </View>
          <View className="flex-row gap-1.5">
            <Button size="sm" className="h-auto rounded-full px-3 py-1.5">
              <Text>English</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border h-auto rounded-full px-3 py-1.5">
              <Text className="text-foreground">বাংলা</Text>
            </Button>
          </View>
        </View>

        {/* ── Hero ── */}
        <View className="bg-brand-hero h-52 justify-end">
          <View className="absolute inset-0 items-center justify-center opacity-10">
            <Text className="text-[90px]">🤱</Text>
          </View>
          <View className="gap-2 px-6 pb-7">
            <Text className="text-2xl font-bold text-white">Welcome to NurtureAI</Text>
            <Text className="text-[13px] leading-5 text-white/80">
              Empowering every parent and health worker with compassionate pediatric care and
              guidance.
            </Text>
          </View>
        </View>

        {/* ── Page content ── */}
        <View className="gap-5 p-5 pb-10">
          {/* Role selection — complex card layout, keep as Pressable */}
          <View className="gap-3">
            <Text className="text-foreground text-[15px] font-semibold">Select your role</Text>
            <View className="flex-row gap-3">
              <Pressable
                className={`flex-1 items-center gap-2.5 rounded-2xl border-2 px-2.5 py-5 ${
                  role === 'parent'
                    ? 'border-primary bg-brand-primary-light'
                    : 'border-border bg-card'
                }`}
                onPress={() => setRole('parent')}>
                <View
                  className={`h-16 w-16 items-center justify-center rounded-full ${
                    role === 'parent' ? 'bg-brand-role-icon-active' : 'bg-brand-role-icon-bg'
                  }`}>
                  <User
                    color={role === 'parent' ? '#1A6B47' : '#6B7280'}
                    size={30}
                    strokeWidth={1.8}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold ${
                    role === 'parent' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  Parent
                </Text>
              </Pressable>

              <Pressable
                className={`flex-1 items-center gap-2.5 rounded-2xl border-2 px-2.5 py-5 ${
                  role === 'health_worker'
                    ? 'border-primary bg-brand-primary-light'
                    : 'border-border bg-card'
                }`}
                onPress={() => setRole('health_worker')}>
                <View
                  className={`h-16 w-16 items-center justify-center rounded-full ${
                    role === 'health_worker' ? 'bg-brand-role-icon-active' : 'bg-brand-role-icon-bg'
                  }`}>
                  <Stethoscope
                    color={role === 'health_worker' ? '#1A6B47' : '#6B7280'}
                    size={30}
                    strokeWidth={1.8}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold ${
                    role === 'health_worker' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  Health Worker
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Register form */}
          <View className="bg-card border-border gap-4 rounded-2xl border p-5">
            <Text className="text-foreground text-lg font-bold">Register Account</Text>

            {/* Full Name */}
            <View className="gap-1.5">
              <Text className="text-muted-foreground text-[13px] font-medium">Full Name</Text>
              <TextInput
                className="border-brand-input-border text-foreground bg-brand-input-bg rounded-xl border px-3.5 py-3 text-[15px]"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Phone */}
            <View className="gap-1.5">
              <Text className="text-muted-foreground text-[13px] font-medium">Phone Number</Text>

              <View className="relative">
                <Icon as={Phone} color="#9CA3AF" size={15} className="absolute top-3.5 left-3" />
                <Input
                  className="web:h-12 h-12 pl-10 text-sm"
                  placeholder="017XX XXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* District + Upazila */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-1.5">
                <Text className="text-muted-foreground text-[13px] font-medium">District</Text>
                <Pressable className="border-brand-input-border bg-brand-input-bg flex-row items-center justify-between rounded-xl border px-3.5 py-3">
                  <Text className="text-muted-foreground text-sm">Select District</Text>
                  <Icon as={ChevronDown} color="#9CA3AF" size={16} />
                </Pressable>

                <DivisionSelect />
              </View>
              <View className="flex-1 gap-1.5">
                <Text className="text-muted-foreground text-[13px] font-medium">Upazila</Text>
                <Pressable className="border-brand-input-border bg-brand-input-bg flex-row items-center justify-between rounded-xl border px-3.5 py-3">
                  <Text className="text-muted-foreground text-sm">Select Upazila</Text>
                  <Icon as={ChevronDown} color="#9CA3AF" size={16} />
                </Pressable>
              </View>
            </View>

            {/* Privacy consent */}
            <Pressable className="flex-row items-start gap-3" onPress={() => setAgreed(!agreed)}>
              <View
                className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                  agreed ? 'bg-primary border-primary' : 'border-brand-input-border'
                }`}>
                {agreed && <Text className="text-[11px] font-bold text-white">✓</Text>}
              </View>
              <Text className="text-muted-foreground flex-1 text-[13px] leading-5">
                I agree to the <Text className="text-primary font-semibold">Privacy Policy</Text>{' '}
                and <Text className="text-primary font-semibold">Terms of Service</Text>, and
                consent to data collection for health guidance.
              </Text>
            </Pressable>
          </View>

          {/* CTA */}
          <Button
            className="h-auto w-full rounded-xl py-4"
            onPress={() => router.push('/onboarding')}>
            <Text>Register</Text>
          </Button>

          {/* Footer */}
          <View className="items-center">
            <Text className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Text className="text-primary font-semibold" onPress={() => router.replace('/login')}>
                Sign In
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
