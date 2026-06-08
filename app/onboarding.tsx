import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowRight, Baby, Heart, Menu } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<'prenatal' | 'postnatal' | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 py-3.5 bg-card border-b border-border">
        <View className="flex-row items-center gap-2.5">
          <Icon as={Menu} color="#1A6B47" size={22} strokeWidth={2} />
          <Text className="text-xl font-bold text-primary">ShishuCare</Text>
        </View>
        <View className="flex-row gap-1.5">
          <Button size="sm" className="h-auto rounded-full px-3 py-1.5">
            <Text>English</Text>
          </Button>
          <Button variant="outline" size="sm" className="h-auto rounded-full border-border px-3 py-1.5">
            <Text className="text-foreground">বাংলা</Text>
          </Button>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

        {/* ── Hero text ── */}
        <View className="items-center px-7 pt-8 pb-6 gap-3.5">
          <Text className="text-[26px] font-extrabold text-foreground text-center leading-9">
            Welcome! Let&apos;s get started with your journey.
          </Text>
          <Text className="text-[15px] text-muted-foreground text-center leading-6">
            Choose your current stage so we can provide the most relevant health
            guidance and personalized tracking for you and your baby.
          </Text>
        </View>

        {/* ── Selection cards — complex vertical layout, keep as Pressable ── */}
        <View className="px-5 gap-4 pb-6">

          <Pressable
            className={`bg-card rounded-2xl border-2 py-7 px-5 items-center gap-2.5 ${
              selected === 'prenatal' ? 'border-primary bg-brand-primary-light' : 'border-border'
            }`}
            onPress={() => setSelected('prenatal')}>
            <View className="w-24 h-24 rounded-full items-center justify-center bg-brand-prenatal">
              <Heart
                color="#1A446B"
                size={44}
                strokeWidth={1.8}
                fill="#1A446B"
                fillOpacity={0.15}
              />
            </View>
            <Text className="text-xl font-bold text-foreground">Prenatal</Text>
            <Text className="text-sm text-muted-foreground">I am expecting a baby</Text>
            <View
              className={`w-12 h-1 rounded-full mt-1.5 ${
                selected === 'prenatal' ? 'bg-primary' : 'bg-border'
              }`}
            />
          </Pressable>

          <Pressable
            className={`bg-card rounded-2xl border-2 py-7 px-5 items-center gap-2.5 ${
              selected === 'postnatal' ? 'border-primary bg-brand-primary-light' : 'border-border'
            }`}
            onPress={() => setSelected('postnatal')}>
            <View className="w-24 h-24 rounded-full items-center justify-center bg-brand-postnatal">
              <Baby color="#1A6B3A" size={44} strokeWidth={1.8} />
            </View>
            <Text className="text-xl font-bold text-foreground">Postnatal</Text>
            <Text className="text-sm text-muted-foreground">I already have a child</Text>
            <View
              className={`w-12 h-1 rounded-full mt-1.5 ${
                selected === 'postnatal' ? 'bg-primary' : 'bg-border'
              }`}
            />
          </Pressable>

        </View>
      </ScrollView>

      {/* ── Continue button ── */}
      <View className="px-5 py-4 bg-card border-t border-border">
        <Button
          className="h-auto w-full rounded-xl py-4 gap-2.5"
          disabled={!selected}
          onPress={() => router.replace('/(tabs)/home')}>
          <Text>Continue to Journey</Text>
          <Icon as={ArrowRight} className="text-primary-foreground" size={18} />
        </Button>
      </View>

    </SafeAreaView>
  );
}
