import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowRight, Baby, Heart } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<'prenatal' | 'postnatal' | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>

        {/* ── Brand bar ── */}
        <View className="flex-row items-center gap-2.5 px-5 pt-5 pb-2">
          <View className="bg-brand-primary-light w-9 h-9 rounded-xl items-center justify-center">
            <Text style={{ fontSize: 16 }}>🌱</Text>
          </View>
          <Text className="text-primary text-[18px] font-bold">ShishuCare</Text>
        </View>

        {/* ── Title ── */}
        <View className="px-5 pt-6 pb-5">
          <View className="bg-brand-primary-light self-start px-3 py-1 rounded-full mb-4">
            <Text className="text-primary text-[11px] font-extrabold tracking-widest">
              GETTING STARTED
            </Text>
          </View>
          <Text className="text-foreground text-[28px] font-extrabold leading-9 mb-2">
            What&apos;s your{'\n'}current journey?
          </Text>
          <Text className="text-muted-foreground text-[15px] leading-6">
            Choose your stage so we can give you the most relevant care guidance and tracking.
          </Text>
        </View>

        {/* ── Selection cards ── */}
        <View className="px-5 gap-4">

          {/* Prenatal */}
          <Pressable
            onPress={() => setSelected('prenatal')}
            style={[
              {
                borderRadius: 24,
                borderWidth: 2,
                padding: 20,
                overflow: 'hidden',
                borderColor: selected === 'prenatal' ? '#0A0A0A' : '#E5E5E5',
                backgroundColor: selected === 'prenatal' ? '#F5F5F5' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: selected === 'prenatal' ? 6 : 2 },
                shadowOpacity: selected === 'prenatal' ? 0.18 : 0.05,
                shadowRadius: selected === 'prenatal' ? 14 : 8,
                elevation: selected === 'prenatal' ? 5 : 1,
              },
            ]}>

            <View className="flex-row items-center gap-4 mb-4">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center bg-brand-prenatal">
                <Heart
                  color="#1E40AF"
                  size={30}
                  strokeWidth={1.8}
                  fill="#1E40AF"
                  fillOpacity={0.15}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-[20px] font-extrabold mb-0.5">
                  Prenatal
                </Text>
                <Text className="text-muted-foreground text-[14px]">I am expecting a baby</Text>
              </View>
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  selected === 'prenatal' ? 'bg-primary' : 'border-2 border-border bg-transparent'
                }`}>
                {selected === 'prenatal' && (
                  <Text className="text-white text-[12px] font-extrabold">✓</Text>
                )}
              </View>
            </View>

            <View className="pt-4 border-t border-border/60">
              <Text className="text-muted-foreground text-[13px] leading-5">
                Track pregnancy progress, get prenatal tips, monitor your baby&apos;s development
                milestones, and access health resources tailored for expectant mothers.
              </Text>
            </View>

            <View className="flex-row gap-2 mt-3 flex-wrap">
              {['Pregnancy tracking', 'Week-by-week tips', 'Doctor visits'].map(tag => (
                <View key={tag} style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ color: '#374151', fontSize: 11, fontWeight: '600' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </Pressable>

          {/* Postnatal */}
          <Pressable
            onPress={() => setSelected('postnatal')}
            style={[
              {
                borderRadius: 24,
                borderWidth: 2,
                padding: 20,
                overflow: 'hidden',
                borderColor: selected === 'postnatal' ? '#0A0A0A' : '#E5E5E5',
                backgroundColor: selected === 'postnatal' ? '#F5F5F5' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: selected === 'postnatal' ? 6 : 2 },
                shadowOpacity: selected === 'postnatal' ? 0.18 : 0.05,
                shadowRadius: selected === 'postnatal' ? 14 : 8,
                elevation: selected === 'postnatal' ? 5 : 1,
              },
            ]}>

            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 rounded-2xl items-center justify-center bg-brand-postnatal">
                <Baby color="#0A0A0A" size={30} strokeWidth={1.8} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-[20px] font-extrabold mb-0.5">
                  Postnatal
                </Text>
                <Text className="text-muted-foreground text-[14px]">I already have a child</Text>
              </View>
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  selected === 'postnatal' ? 'bg-primary' : 'border-2 border-border bg-transparent'
                }`}>
                {selected === 'postnatal' && (
                  <Text className="text-white text-[12px] font-extrabold">✓</Text>
                )}
              </View>
            </View>

            <View className="pt-4 border-t border-border/60">
              <Text className="text-muted-foreground text-[13px] leading-5">
                Track your child&apos;s development, vaccination schedule, feeding and sleep logs,
                and get personalised AI health guidance from NurtureAI.
              </Text>
            </View>

            <View className="flex-row gap-2 mt-3 flex-wrap">
              {['Feeding log', 'Vaccine tracker', 'Milestones'].map(tag => (
                <View key={tag} style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ color: '#374151', fontSize: 11, fontWeight: '600' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View
        className="px-5 py-4 bg-card border-t border-border"
        style={{ paddingBottom: 24 }}>
        <Pressable
          className={`h-14 rounded-2xl items-center justify-center flex-row gap-2.5 ${
            selected ? 'bg-primary' : 'bg-primary/40'
          }`}
          disabled={!selected}
          onPress={() => router.push(selected === 'prenatal' ? '/child-info-prenatal' : '/child-info-postnatal')}
          style={
            selected
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 6,
                }
              : undefined
          }>
          <Text className="text-white text-[16px] font-bold">
            {selected
              ? `Start ${selected === 'prenatal' ? 'Prenatal' : 'Postnatal'} Journey`
              : 'Select a Journey to Continue'}
          </Text>
          {selected && <Icon as={ArrowRight} className="text-white" size={18} />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
