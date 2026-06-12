import { Text } from '@/components/ui/text';
import { getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ── Data ──────────────────────────────────────────────────────────────────

type CountItem = { emoji: string; nameBn: string; nameEn: string };

const ITEMS_YOUNG: CountItem[] = [
  { emoji: '🥭', nameBn: 'আম', nameEn: 'Mango' },
  { emoji: '🐟', nameBn: 'মাছ', nameEn: 'Fish' },
  { emoji: '🌸', nameBn: 'ফুল', nameEn: 'Flower' },
  { emoji: '⭐', nameBn: 'তারা', nameEn: 'Star' },
  { emoji: '🍌', nameBn: 'কলা', nameEn: 'Banana' },
  { emoji: '🐄', nameBn: 'গরু', nameEn: 'Cow' },
  { emoji: '🦆', nameBn: 'হাঁস', nameEn: 'Duck' },
  { emoji: '☁️', nameBn: 'মেঘ', nameEn: 'Cloud' },
];

const ITEMS_OLDER: CountItem[] = [
  ...ITEMS_YOUNG,
  { emoji: '🐠', nameBn: 'রঙিন মাছ', nameEn: 'Colorful Fish' },
  { emoji: '🌙', nameBn: 'চাঁদ', nameEn: 'Moon' },
  { emoji: '🍈', nameBn: 'কাঁঠাল', nameEn: 'Jackfruit' },
  { emoji: '🐦', nameBn: 'পাখি', nameEn: 'Bird' },
];

function getRoundMax(ageMonths: number) {
  if (ageMonths < 24) return 5;
  if (ageMonths < 36) return 5;
  return 10;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeOptions(correct: number, max: number): number[] {
  const opts = new Set<number>([correct]);
  while (opts.size < 4) {
    const n = Math.floor(Math.random() * max) + 1;
    opts.add(n);
  }
  return shuffle(Array.from(opts));
}

// ── Option Button ─────────────────────────────────────────────────────────

type BtnState = 'idle' | 'correct' | 'wrong';

function OptionBtn({
  number,
  state,
  onPress,
}: {
  number: number;
  state: BtnState;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (state === 'correct') scale.value = withSequence(withSpring(1.15), withSpring(1));
    if (state === 'wrong') scale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1));
  }, [state]);

  const bg =
    state === 'correct' ? '#DCFCE7' :
    state === 'wrong'   ? '#FEE2E2' : '#F5F5F5';
  const border =
    state === 'correct' ? '#86EFAC' :
    state === 'wrong'   ? '#FECACA' : '#E5E5E5';
  const color =
    state === 'correct' ? '#166534' :
    state === 'wrong'   ? '#DC2626' : '#0A0A0A';

  return (
    <Animated.View style={[animStyle, { width: '22%' }]}>
      <Pressable
        onPress={onPress}
        disabled={state !== 'idle'}
        style={{
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: border,
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: '900', color }}>{number}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

export default function CountGameScreen() {
  const [ageMonths, setAgeMonths] = useState(18);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const items = ageMonths >= 36 ? ITEMS_OLDER : ITEMS_YOUNG;
  const roundMax = getRoundMax(ageMonths);

  // Seeded per round so it's stable
  const itemRef = useRef(items[round % items.length]);
  const countRef = useRef(Math.floor(Math.random() * roundMax) + 1);
  const optionsRef = useRef(makeOptions(countRef.current, roundMax));

  const [item, setItem] = useState(itemRef.current);
  const [count, setCount] = useState(countRef.current);
  const [options, setOptions] = useState(optionsRef.current);

  const scoreScale = useSharedValue(1);
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setAgeMonths(getAgeMonths(c.dob));
    });
  }, []);

  const handleOption = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === count) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      scoreScale.value = withSequence(withSpring(1.3), withSpring(1));
      setTimeout(nextRound, 900);
    } else {
      setStreak(0);
      setTimeout(nextRound, 1200);
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    const newItem = items[Math.floor(Math.random() * items.length)];
    const newCount = Math.floor(Math.random() * roundMax) + 1;
    const newOptions = makeOptions(newCount, roundMax);
    setItem(newItem);
    setCount(newCount);
    setOptions(newOptions);
    setSelected(null);
  };

  const getOptionState = (n: number): BtnState => {
    if (selected === null) return 'idle';
    if (n === count) return 'correct';
    if (n === selected) return 'wrong';
    return 'idle';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
        >
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Count It!</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>গণনা করো</Text>
        </View>
        <Animated.View style={[scoreStyle, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>

        {/* Streak banner */}
        {streak >= 3 && (
          <Animated.View entering={FadeIn.duration(300)} style={{ backgroundColor: '#FFF7ED', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, marginBottom: 20, borderWidth: 1, borderColor: '#FED7AA' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', textAlign: 'center' }}>
              🔥 {streak} in a row! দারুণ!
            </Text>
          </Animated.View>
        )}

        {/* Question card */}
        <Animated.View
          key={`card-${round}`}
          entering={FadeInDown.duration(350)}
          style={{ backgroundColor: '#F8FAFC', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Text style={{ fontSize: 14, color: '#737373', marginBottom: 6 }}>How many {item.nameEn}?</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0A0A0A', marginBottom: 24 }}>
            কতগুলো {item.nameBn}?
          </Text>

          {/* Emoji grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            {Array.from({ length: count }).map((_, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(250).delay(i * 60)}>
                <Text style={{ fontSize: count > 6 ? 36 : 44 }}>{item.emoji}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Instructions */}
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 16 }}>Tap the correct number</Text>

        {/* Number options */}
        <View style={{ flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'center' }}>
          {options.map(n => (
            <OptionBtn
              key={`${round}-${n}`}
              number={n}
              state={getOptionState(n)}
              onPress={() => handleOption(n)}
            />
          ))}
        </View>

        {/* Feedback */}
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === count ? '#166534' : '#DC2626' }}>
              {selected === count ? '🎉 সঠিক! Correct!' : `উত্তর ছিল: ${count} টি ${item.emoji}`}
            </Text>
          </Animated.View>
        )}

        {/* Round info */}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {round + 1} · Age group: {getAgeBracket(ageMonths)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
