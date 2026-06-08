import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Redirect, router } from 'expo-router';
import { Lock, Menu, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!phone || !password) {
      setError('Please enter your phone number and password.');
      return;
    }
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
    <SafeAreaView className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View className="bg-card border-border flex-row items-center justify-between border-b px-5 py-3.5">
          <Text className="text-primary text-xl font-bold">ShishuCare</Text>

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
            <Text className="text-2xl font-bold text-white">Welcome Back</Text>
            <Text className="text-[13px] leading-5 text-white/80">
              Sign in to continue your child&apos;s health journey with personalized care and
              guidance.
            </Text>
          </View>
        </View>

        {/* ── Page content ── */}
        <View className="gap-5 p-5 pb-10">
          {/* Login form */}
          <View className="border-border bg-card gap-4 rounded-2xl border p-5">
            <Text className="text-foreground text-lg font-bold">Sign In</Text>

            {error && (
              <View className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                <Text className="text-[13px] text-red-600">{error}</Text>
              </View>
            )}

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

            {/* Password */}
            <View className="gap-1.5">
              <Text className="text-muted-foreground text-[13px] font-medium">Password</Text>
              <View className="relative">
                <Icon as={Lock} color="#9CA3AF" size={15} className="absolute top-3.5 left-3" />

                <Input
                  className="web:h-12 h-12 pl-10 text-sm"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
          </View>

          {/* CTA */}
          <Button
            className="h-auto w-full rounded-xl py-4"
            onPress={handleLogin}
            disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text>Sign In</Text>}
          </Button>

          {/* Footer */}
          <View className="items-center">
            <Text className="text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Text
                className="text-primary font-semibold"
                onPress={() => router.replace('/register')}>
                Register
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
