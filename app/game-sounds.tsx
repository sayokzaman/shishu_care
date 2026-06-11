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
} from 'react-native-reanimated';

// ── Data ──────────────────────────────────────────────────────────────────

type Animal = {
  emoji: string;
  nameEn: string;
  nameBn: string;
  sound: string;       // in English romanized
  soundBn: string;     // in Bangla
};

const ANIMALS: Animal[] = [
  { emoji: '🐄', nameEn: 'Cow',     nameBn: 'গরু',   sound: 'Hamba!',      soundBn: 'হাম্বা!' },
  { emoji: '🐐', nameEn: 'Goat',    nameBn: 'ছাগল',  sound: 'Mya mya!',    soundBn: 'ম্যা ম্যা!' },
  { emoji: '🐕', nameEn: 'Dog',     nameBn: 'কুকুর', sound: 'Gheu gheu!',  soundBn: 'ঘেউ ঘেউ!' },
  { emoji: '🐱', nameEn: 'Cat',     nameBn: 'বিড়াল', sound: 'Mew mew!',    soundBn: 'মিউ মিউ!' },
  { emoji: '🐦', nameEn: 'Bird',    nameBn: 'পাখি',  sound: 'Tweet tweet!', soundBn: 'টুইট টুইট!' },
  { emoji: '🐸', nameEn: 'Frog',    nameBn: 'ব্যাঙ',  sound: 'Ribbit!',     soundBn: 'ব্যাঙের ডাক!' },
  { emoji: '🐓', nameEn: 'Rooster', nameBn: 'মোরগ',  sound: 'Kukuruku!',   soundBn: 'কুকুরু কু!' },
  { emoji: '🐘', nameEn: 'Elephant',nameBn: 'হাতি',  sound: 'Prrr!',       soundBn: 'হাতির ডাক!' },
  { emoji: '🐯', nameEn: 'Tiger',   nameBn: 'বাঘ',   sound: 'Roar!',       soundBn: 'গর্জন!' },
  { emoji: '🦆', nameEn: 'Duck',    nameBn: 'হাঁস',  sound: 'Quack quack!', soundBn: 'প্যাঁক প্যাঁক!' },
  { emoji: '🐑', nameEn: 'Sheep',   nameBn: 'ভেড়া',  sound: 'Baa baa!',    soundBn: 'ব্যা ব্যা!' },
  { emoji: '🦁', nameEn: 'Lion',    nameBn: 'সিংহ',  sound: 'Roar!',       soundBn: 'গর্জন!' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Round = {
  answer: Animal;
  options: Animal[];
};

function makeRound(prevAnswerEmoji?: string): Round {
  const pool = prevAnswerEmoji
    ? ANIMALS.filter(a => a.emoji !== prevAnswerEmoji)
    : ANIMALS;
  const shuffled = shuffle(pool);
  const answer = shuffled[0];
  // Pick 2 distractors from full pool excluding answer
  const distractors = shuffle(ANIMALS.filter(a => a.emoji !== answer.emoji)).slice(0, 2);
  const options = shuffle([answer, ...distractors]);
  return { answer, options };
}

// ── Animal Option ─────────────────────────────────────────────────────────

type BtnState = 'idle' | 'correct' | 'wrong';

function AnimalBtn({
  animal,
  state,
  onPress,
}: {
  animal: Animal;
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
    scale.value = withSequence(withSpring(0.9), withSpring(1.08), withSpring(1));
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
          paddingVertical: 22,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 48 }}>{animal.emoji}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>{animal.nameBn}</Text>
        <Text style={{ fontSize: 11, color: '#737373' }}>{animal.nameEn}</Text>
        {state === 'correct' && <Text style={{ fontSize: 18 }}>✅</Text>}
        {state === 'wrong'   && <Text style={{ fontSize: 18 }}>❌</Text>}
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

export default function SoundsGameScreen() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ answer, options }, setRound] = useState<Round>(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);

  const scoreScale = useSharedValue(1);
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handleSelect = (animal: Animal) => {
    if (selected !== null) return;
    setSelected(animal.emoji);
    if (animal.emoji === answer.emoji) {
      setScore(s => s + 1);
      scoreScale.value = withSequence(withSpring(1.4), withSpring(1));
      setTimeout(() => nextRound(answer.emoji), 950);
    } else {
      setTimeout(() => nextRound(answer.emoji), 1400);
    }
  };

  const nextRound = (prevEmoji: string) => {
    setRound(makeRound(prevEmoji));
    setRoundNum(r => r + 1);
    setSelected(null);
  };

  const getState = (animal: Animal): BtnState => {
    if (selected === null) return 'idle';
    if (animal.emoji === answer.emoji) return 'correct';
    if (animal.emoji === selected) return 'wrong';
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
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Animal Sounds</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>প্রাণীর ডাক</Text>
        </View>
        <Animated.View style={[scoreStyle, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>

        {/* Sound question card */}
        <Animated.View
          key={`sound-${roundNum}`}
          entering={FadeInDown.duration(350)}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 28, padding: 32, width: '100%', alignItems: 'center', marginBottom: 32 }}
        >
          {/* Sound wave decoration */}
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16, alignItems: 'center' }}>
            {[16, 28, 20, 36, 20, 28, 16].map((h, i) => (
              <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: '#FCD34D', opacity: 0.7 }} />
            ))}
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>
            কোন প্রাণী বলে...
          </Text>
          <Text style={{ color: '#FCD34D', fontSize: 34, fontWeight: '900', textAlign: 'center', marginBottom: 6 }}>
            "{answer.soundBn}"
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontStyle: 'italic' }}>
            "{answer.sound}"
          </Text>

          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 16 }}>
            Which animal makes this sound?
          </Text>
        </Animated.View>

        {/* Instructions */}
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>
          Tap the right animal · সঠিক প্রাণীটি বেছে নাও
        </Text>

        {/* Animal options */}
        <Animated.View
          key={`opts-${roundNum}`}
          entering={FadeInDown.duration(350).delay(80)}
          style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}
        >
          {options.map(animal => (
            <AnimalBtn
              key={`${roundNum}-${animal.emoji}`}
              animal={animal}
              state={getState(animal)}
              onPress={() => handleSelect(animal)}
            />
          ))}
        </Animated.View>

        {/* Feedback */}
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 24, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: isCorrect ? '#166534' : '#DC2626' }}>
              {isCorrect ? '🎉 সঠিক! Correct!' : `উত্তর ছিল ${answer.nameBn} ${answer.emoji}`}
            </Text>
            {isCorrect && (
              <Text style={{ fontSize: 14, color: '#737373' }}>
                {answer.nameBn} বলে "{answer.soundBn}"
              </Text>
            )}
          </Animated.View>
        )}

        {/* Score milestones */}
        {score > 0 && score % 5 === 0 && selected !== null && (
          <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: 16, backgroundColor: '#FFF7ED', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#FED7AA' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#92400E', textAlign: 'center' }}>
              🏆 {score} points! অসাধারণ!
            </Text>
          </Animated.View>
        )}

        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
