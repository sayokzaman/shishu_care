import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
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

type Shape = {
  emoji: string;
  nameEn: string;
  nameBn: string;
};

const SHAPES: Shape[] = [
  { emoji: '⭕', nameEn: 'Circle',    nameBn: 'বৃত্ত' },
  { emoji: '⬛', nameEn: 'Square',    nameBn: 'বর্গক্ষেত্র' },
  { emoji: '🔺', nameEn: 'Triangle',  nameBn: 'ত্রিভুজ' },
  { emoji: '⭐', nameEn: 'Star',      nameBn: 'তারা' },
  { emoji: '❤️', nameEn: 'Heart',     nameBn: 'হৃদয়' },
  { emoji: '🔷', nameEn: 'Diamond',   nameBn: 'হীরা' },
  { emoji: '🌙', nameEn: 'Crescent',  nameBn: 'অর্ধচন্দ্র' },
  { emoji: '🔘', nameEn: 'Circle',    nameBn: 'বৃত্ত' },
];

// Deduplicated shapes for picking
const UNIQUE_SHAPES: Shape[] = [
  { emoji: '⭕', nameEn: 'Circle',    nameBn: 'বৃত্ত' },
  { emoji: '⬛', nameEn: 'Square',    nameBn: 'বর্গক্ষেত্র' },
  { emoji: '🔺', nameEn: 'Triangle',  nameBn: 'ত্রিভুজ' },
  { emoji: '⭐', nameEn: 'Star',      nameBn: 'তারা' },
  { emoji: '❤️', nameEn: 'Heart',     nameBn: 'হৃদয়' },
  { emoji: '🔷', nameEn: 'Diamond',   nameBn: 'হীরা' },
  { emoji: '🌙', nameEn: 'Crescent',  nameBn: 'অর্ধচন্দ্র' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeRound(): { answer: Shape; options: Shape[] } {
  const shuffled = shuffle(UNIQUE_SHAPES);
  const answer = shuffled[0];
  const distractors = shuffled.slice(1, 3);
  const options = shuffle([answer, ...distractors]);
  return { answer, options };
}

// ── Option Button ─────────────────────────────────────────────────────────

type BtnState = 'idle' | 'correct' | 'wrong';

function ShapeBtn({
  shape,
  state,
  onPress,
}: {
  shape: Shape;
  state: BtnState;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    state === 'correct' ? '#DCFCE7' :
    state === 'wrong'   ? '#FEE2E2' : '#F5F5F5';
  const border =
    state === 'correct' ? '#86EFAC' :
    state === 'wrong'   ? '#FECACA' : '#E5E5E5';

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.9), withSpring(1));
    onPress();
  };

  return (
    <Animated.View style={[animStyle, { width: '30%' }]}>
      <Pressable
        onPress={handlePress}
        disabled={state !== 'idle'}
        style={{
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: border,
          borderRadius: 20,
          paddingVertical: 20,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 42 }}>{shape.emoji}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
          {shape.nameBn}
        </Text>
        <Text style={{ fontSize: 10, color: '#737373' }}>{shape.nameEn}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

export default function ShapeGameScreen() {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [{ answer, options }, setRoundData] = useState(makeRound);
  const [selected, setSelected] = useState<string | null>(null);

  const scoreScale = useSharedValue(1);
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handleSelect = (shape: Shape) => {
    if (selected !== null) return;
    setSelected(shape.emoji);
    if (shape.emoji === answer.emoji) {
      setScore(s => s + 1);
      scoreScale.value = withSequence(withSpring(1.3), withSpring(1));
      setTimeout(nextRound, 900);
    } else {
      setTimeout(nextRound, 1300);
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setRoundData(makeRound());
    setSelected(null);
  };

  const getState = (shape: Shape): BtnState => {
    if (selected === null) return 'idle';
    if (shape.emoji === answer.emoji) return 'correct';
    if (shape.emoji === selected) return 'wrong';
    return 'idle';
  };

  const isCorrect = selected !== null && selected === answer.emoji;

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
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Shape Match</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>আকৃতি মেলাও</Text>
        </View>
        <Animated.View style={[scoreStyle, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>

        {/* Progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, width: '100%' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i < (score % 8) ? '#0A0A0A' : '#E5E5E5',
              }}
            />
          ))}
        </View>

        {/* Question card */}
        <Animated.View
          key={`q-${round}`}
          entering={FadeInDown.duration(350)}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 28, padding: 36, width: '100%', alignItems: 'center', marginBottom: 32 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Find the shape</Text>
          <Text style={{ color: '#FCD34D', fontSize: 32, fontWeight: '900', marginBottom: 4 }}>
            {answer.nameBn}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '600' }}>
            {answer.nameEn}
          </Text>
          {/* Big preview */}
          <Text style={{ fontSize: 88, marginTop: 16, opacity: 0.15 }}>{answer.emoji}</Text>
        </Animated.View>

        {/* Instructions */}
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>
          Tap the matching shape · সঠিক আকৃতিটি বেছে নাও
        </Text>

        {/* Shape options */}
        <Animated.View
          key={`opts-${round}`}
          entering={FadeInDown.duration(350).delay(80)}
          style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}
        >
          {options.map(shape => (
            <ShapeBtn
              key={`${round}-${shape.nameEn}`}
              shape={shape}
              state={getState(shape)}
              onPress={() => handleSelect(shape)}
            />
          ))}
        </Animated.View>

        {/* Feedback */}
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: isCorrect ? '#166534' : '#DC2626' }}>
              {isCorrect
                ? '🎉 সঠিক! Correct!'
                : `উত্তর ছিল ${answer.nameBn} ${answer.emoji}`}
            </Text>
          </Animated.View>
        )}

        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {round + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
