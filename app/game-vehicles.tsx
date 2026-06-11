import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type VehicleType = 'land' | 'air' | 'water';
type Vehicle = { emoji: string; nameEn: string; nameBn: string; type: VehicleType };

const VEHICLES: Vehicle[] = [
  { emoji: '🚗', nameEn: 'Car',        nameBn: 'গাড়ি',     type: 'land' },
  { emoji: '🚌', nameEn: 'Bus',        nameBn: 'বাস',      type: 'land' },
  { emoji: '🚂', nameEn: 'Train',      nameBn: 'ট্রেন',    type: 'land' },
  { emoji: '🚲', nameEn: 'Bicycle',    nameBn: 'সাইকেল',  type: 'land' },
  { emoji: '🛺', nameEn: 'Rickshaw',   nameBn: 'রিকশা',   type: 'land' },
  { emoji: '✈️', nameEn: 'Airplane',   nameBn: 'বিমান',    type: 'air' },
  { emoji: '🚁', nameEn: 'Helicopter', nameBn: 'হেলিকপ্টার', type: 'air' },
  { emoji: '🪂', nameEn: 'Parachute',  nameBn: 'প্যারাসুট', type: 'air' },
  { emoji: '🚀', nameEn: 'Rocket',     nameBn: 'রকেট',    type: 'air' },
  { emoji: '🚢', nameEn: 'Ship',       nameBn: 'জাহাজ',   type: 'water' },
  { emoji: '⛵', nameEn: 'Sailboat',   nameBn: 'নৌকা',    type: 'water' },
  { emoji: '🛶', nameEn: 'Rowboat',    nameBn: 'ডিঙি',    type: 'water' },
  { emoji: '⛴️', nameEn: 'Ferry',      nameBn: 'ফেরি',    type: 'water' },
];

const TYPE_LABELS: Record<VehicleType, { en: string; bn: string; emoji: string }> = {
  land:  { en: 'Land',  bn: 'স্থলপথ',  emoji: '🛣️' },
  air:   { en: 'Air',   bn: 'আকাশপথ', emoji: '🌤️' },
  water: { en: 'Water', bn: 'জলপথ',   emoji: '🌊' },
};

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(prevEmoji?: string) {
  const pool = prevEmoji ? VEHICLES.filter(v => v.emoji !== prevEmoji) : VEHICLES;
  const answer = shuffle(pool)[0];
  const types: VehicleType[] = ['land', 'air', 'water'];
  const opts = shuffle(types);
  return { vehicle: answer, options: opts };
}

export default function VehiclesGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ vehicle, options }, setRound] = useState(() => makeRound());
  const [selected, setSelected] = useState<VehicleType | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (type: VehicleType) => {
    if (selected) return;
    setSelected(type);
    if (type === vehicle.type) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(vehicle.emoji), 900); }
    else setTimeout(() => next(vehicle.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };

  const getBg = (type: VehicleType) => !selected ? '#F5F5F5' : type === vehicle.type ? '#DCFCE7' : type === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (type: VehicleType) => !selected ? '#E5E5E5' : type === vehicle.type ? '#86EFAC' : type === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Vehicles Sort</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>যানবাহন · Ages 2–4y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>এটি কোথায় চলে? · Where does this go?</Text>
          <Text style={{ fontSize: 100, marginVertical: 10 }}>{vehicle.emoji}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 26, fontWeight: '900' }}>{vehicle.nameBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>{vehicle.nameEn}</Text>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>Land, Air or Water? · স্থল, আকাশ নাকি জল?</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {options.map(type => {
            const info = TYPE_LABELS[type];
            const s = useSharedValue(1);
            const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
            return (
              <Animated.View key={type} style={[a, { width: '30%' }]}>
                <Pressable onPress={() => { s.value = withSequence(withSpring(0.9), withSpring(1)); handle(type); }}
                  disabled={!!selected} style={{ backgroundColor: getBg(type), borderWidth: 2, borderColor: getBorder(type), borderRadius: 20, paddingVertical: 22, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 36 }}>{info.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#0A0A0A', textAlign: 'center' }}>{info.bn}</Text>
                  <Text style={{ fontSize: 11, color: '#737373' }}>{info.en}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === vehicle.type ? '#166534' : '#DC2626' }}>
              {selected === vehicle.type ? `🎉 সঠিক! ${vehicle.nameBn} ${TYPE_LABELS[vehicle.type].bn}তে চলে!` : `উত্তর ছিল ${TYPE_LABELS[vehicle.type].bn} ${TYPE_LABELS[vehicle.type].emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
