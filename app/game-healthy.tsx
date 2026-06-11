import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Food = { emoji: string; nameEn: string; nameBn: string; healthy: boolean; reason: string; reasonBn: string };

const FOODS: Food[] = [
  { emoji: '🥭', nameEn: 'Mango',      nameBn: 'আম',      healthy: true,  reason: 'Rich in vitamins!',       reasonBn: 'ভিটামিনে ভরপুর!' },
  { emoji: '🍌', nameEn: 'Banana',     nameBn: 'কলা',     healthy: true,  reason: 'Great energy boost!',     reasonBn: 'শক্তি দেয়!' },
  { emoji: '🍫', nameEn: 'Chocolate',  nameBn: 'চকলেট',   healthy: false, reason: 'Too much sugar!',         reasonBn: 'বেশি চিনি আছে!' },
  { emoji: '🥦', nameEn: 'Broccoli',   nameBn: 'ব্রকলি',  healthy: true,  reason: 'Full of nutrients!',      reasonBn: 'পুষ্টিগুণে ভরা!' },
  { emoji: '🍕', nameEn: 'Pizza',      nameBn: 'পিৎজা',   healthy: false, reason: 'Too much fat!',           reasonBn: 'বেশি চর্বি আছে!' },
  { emoji: '🥛', nameEn: 'Milk',       nameBn: 'দুধ',     healthy: true,  reason: 'Makes bones strong!',     reasonBn: 'হাড় শক্ত করে!' },
  { emoji: '🍬', nameEn: 'Candy',      nameBn: 'ক্যান্ডি', healthy: false, reason: 'Causes tooth decay!',    reasonBn: 'দাঁত নষ্ট করে!' },
  { emoji: '🍚', nameEn: 'Rice',       nameBn: 'ভাত',     healthy: true,  reason: 'Good carbohydrates!',     reasonBn: 'ভালো শক্তির উৎস!' },
  { emoji: '🐟', nameEn: 'Fish',       nameBn: 'মাছ',     healthy: true,  reason: 'Protein for growth!',     reasonBn: 'বেড়ে উঠতে সাহায্য করে!' },
  { emoji: '🥤', nameEn: 'Soda',       nameBn: 'কোমল পানীয়', healthy: false, reason: 'Too much sugar!',   reasonBn: 'বেশি চিনি আছে!' },
  { emoji: '🥚', nameEn: 'Egg',        nameBn: 'ডিম',     healthy: true,  reason: 'Full of protein!',        reasonBn: 'প্রোটিনে ভরপুর!' },
  { emoji: '🍟', nameEn: 'Fries',      nameBn: 'ফ্রাই',   healthy: false, reason: 'Too much oil!',           reasonBn: 'বেশি তেল আছে!' },
  { emoji: '🌾', nameEn: 'Grain',      nameBn: 'শস্য',    healthy: true,  reason: 'Gives energy!',           reasonBn: 'শক্তি দেয়!' },
  { emoji: '🍦', nameEn: 'Ice cream',  nameBn: 'আইসক্রিম', healthy: false, reason: 'Occasional treat only!', reasonBn: 'মাঝেমধ্যে খাও!' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function HealthyFoodGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [foods] = useState(() => shuffle(FOODS));
  const food = foods[roundNum % foods.length];
  const [selected, setSelected] = useState<boolean | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (choice: boolean) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === food.healthy) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 1100); }
    else setTimeout(next, 1400);
  };
  const next = () => { setRoundNum(r => r + 1); setSelected(null); };

  const isCorrect = selected !== null && selected === food.healthy;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Healthy Food</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>স্বাস্থ্যকর খাবার · Ages 2–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>এটি কি স্বাস্থ্যকর? · Is this healthy?</Text>
          <Text style={{ fontSize: 100, marginVertical: 12 }}>{food.emoji}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 26, fontWeight: '900' }}>{food.nameBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>{food.nameEn}</Text>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
          {/* Healthy */}
          <Pressable onPress={() => handle(true)} disabled={selected !== null}
            style={{ flex: 1, backgroundColor: selected === null ? '#F0FDF4' : selected === true && food.healthy ? '#DCFCE7' : selected === true ? '#FEE2E2' : food.healthy && selected !== null ? '#DCFCE7' : '#F0FDF4',
              borderWidth: 2, borderColor: selected === null ? '#86EFAC' : selected === true && food.healthy ? '#22C55E' : selected === true ? '#FECACA' : food.healthy && selected !== null ? '#22C55E' : '#86EFAC',
              borderRadius: 20, paddingVertical: 24, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 44 }}>✅</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#166534' }}>স্বাস্থ্যকর</Text>
            <Text style={{ fontSize: 13, color: '#166534' }}>Healthy</Text>
          </Pressable>
          {/* Unhealthy */}
          <Pressable onPress={() => handle(false)} disabled={selected !== null}
            style={{ flex: 1, backgroundColor: selected === null ? '#FFF1F2' : selected === false && !food.healthy ? '#DCFCE7' : selected === false ? '#FEE2E2' : !food.healthy && selected !== null ? '#DCFCE7' : '#FFF1F2',
              borderWidth: 2, borderColor: selected === null ? '#FECACA' : selected === false && !food.healthy ? '#22C55E' : selected === false ? '#EF4444' : !food.healthy && selected !== null ? '#22C55E' : '#FECACA',
              borderRadius: 20, paddingVertical: 24, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 44 }}>❌</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#DC2626' }}>অস্বাস্থ্যকর</Text>
            <Text style={{ fontSize: 13, color: '#DC2626' }}>Unhealthy</Text>
          </Pressable>
        </View>

        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20, padding: 16, backgroundColor: isCorrect ? '#F0FDF4' : '#FFF1F2', borderRadius: 16, width: '100%', borderWidth: 1, borderColor: isCorrect ? '#86EFAC' : '#FECACA' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: isCorrect ? '#166534' : '#DC2626', marginBottom: 4 }}>
              {isCorrect ? '🎉 সঠিক!' : '❌ ভুল হয়েছে'}
            </Text>
            <Text style={{ fontSize: 14, color: isCorrect ? '#166534' : '#DC2626' }}>{food.reasonBn}</Text>
            <Text style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>{food.reason}</Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1} of {FOODS.length}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
