import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Category = { label: string; labelBn: string; emoji: string; color: string };
type Item = { emoji: string; category: string };
type Round = { item: Item; categories: Category[]; correctIdx: number };

const CATEGORIES: Category[] = [
  { label: 'Animal',   labelBn: 'প্রাণী',    emoji: '🐾', color: '#FFF7ED' },
  { label: 'Food',     labelBn: 'খাবার',     emoji: '🍽️', color: '#F0FDF4' },
  { label: 'Vehicle',  labelBn: 'যানবাহন',  emoji: '🚦', color: '#EFF6FF' },
  { label: 'Clothing', labelBn: 'পোশাক',    emoji: '👔', color: '#FFF1F2' },
  { label: 'Nature',   labelBn: 'প্রকৃতি',   emoji: '🌿', color: '#F0FDF4' },
];

const ITEMS: Item[] = [
  { emoji: '🐄', category: 'Animal' }, { emoji: '🐐', category: 'Animal' }, { emoji: '🐟', category: 'Animal' },
  { emoji: '🦁', category: 'Animal' }, { emoji: '🐘', category: 'Animal' },
  { emoji: '🍚', category: 'Food' },   { emoji: '🥭', category: 'Food' },   { emoji: '🍌', category: 'Food' },
  { emoji: '🍛', category: 'Food' },   { emoji: '🍈', category: 'Food' },
  { emoji: '🚗', category: 'Vehicle' },{ emoji: '✈️', category: 'Vehicle' },{ emoji: '🚢', category: 'Vehicle' },
  { emoji: '🚌', category: 'Vehicle' },{ emoji: '🚲', category: 'Vehicle' },
  { emoji: '👕', category: 'Clothing' },{ emoji: '👗', category: 'Clothing' },{ emoji: '👖', category: 'Clothing' },
  { emoji: '🧢', category: 'Clothing' },{ emoji: '👟', category: 'Clothing' },
  { emoji: '🌳', category: 'Nature' }, { emoji: '🌺', category: 'Nature' }, { emoji: '🌊', category: 'Nature' },
  { emoji: '⛰️', category: 'Nature' }, { emoji: '🌙', category: 'Nature' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(usedEmojis: Set<string>): Round {
  const pool = ITEMS.filter(i => !usedEmojis.has(i.emoji));
  const item = (pool.length > 0 ? shuffle(pool) : shuffle(ITEMS))[0];
  const correctCat = CATEGORIES.find(c => c.label === item.category)!;
  const others = shuffle(CATEGORIES.filter(c => c.label !== item.category)).slice(0, 2);
  const cats = shuffle([correctCat, ...others]);
  return { item, categories: cats, correctIdx: cats.indexOf(correctCat) };
}

export default function SortGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [used] = useState(() => new Set<string>());
  const [round, setRound] = useState<Round>(() => makeRound(new Set()));
  const [selected, setSelected] = useState<number | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));
  const itemScale = useSharedValue(1);
  const itemAnim = useAnimatedStyle(() => ({ transform: [{ scale: itemScale.value }] }));

  const handle = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    itemScale.value = withSequence(withSpring(1.2), withSpring(1));
    if (idx === round.correctIdx) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 900); }
    else setTimeout(next, 1300);
  };
  const next = () => {
    used.add(round.item.emoji);
    if (used.size >= ITEMS.length) used.clear();
    setRound(makeRound(used));
    setRoundNum(r => r + 1);
    setSelected(null);
  };

  const getBg = (idx: number) => selected === null ? round.categories[idx].color : idx === round.correctIdx ? '#DCFCE7' : idx === selected ? '#FEE2E2' : round.categories[idx].color;
  const getBorder = (idx: number) => selected === null ? 'rgba(0,0,0,0.06)' : idx === round.correctIdx ? '#86EFAC' : idx === selected ? '#FECACA' : 'rgba(0,0,0,0.06)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Sort It!</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>বাছাই করো · Ages 2–4y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`item-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>এটি কোন দলে পড়ে? · Where does this belong?</Text>
          <Animated.View style={itemAnim}>
            <Text style={{ fontSize: 96 }}>{round.item.emoji}</Text>
          </Animated.View>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 16 }}>Tap the right category · সঠিক দলটি বেছে নাও</Text>
        <Animated.View key={`cats-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ width: '100%', gap: 10 }}>
          {round.categories.map((cat, idx) => (
            <Pressable key={cat.label} onPress={() => handle(idx)}
              style={{ backgroundColor: getBg(idx), borderWidth: 2, borderColor: getBorder(idx), borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>{cat.labelBn}</Text>
                <Text style={{ fontSize: 13, color: '#737373' }}>{cat.label}</Text>
              </View>
              {selected !== null && idx === round.correctIdx && <Text style={{ marginLeft: 'auto', fontSize: 22 }}>✅</Text>}
              {selected !== null && idx === selected && idx !== round.correctIdx && <Text style={{ marginLeft: 'auto', fontSize: 22 }}>❌</Text>}
            </Pressable>
          ))}
        </Animated.View>
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === round.correctIdx ? '#166534' : '#DC2626' }}>
              {selected === round.correctIdx ? '🎉 সঠিক!' : `উত্তর ছিল ${round.categories[round.correctIdx].labelBn}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
