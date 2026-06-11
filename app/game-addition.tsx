import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Question = { a: number; b: number; emoji: string; nameBn: string };

const EMOJIS = [
  { emoji: '🥭', nameBn: 'আম' }, { emoji: '🐟', nameBn: 'মাছ' }, { emoji: '⭐', nameBn: 'তারা' },
  { emoji: '🌺', nameBn: 'ফুল' }, { emoji: '🍌', nameBn: 'কলা' }, { emoji: '🐄', nameBn: 'গরু' },
  { emoji: '🦆', nameBn: 'হাঁস' }, { emoji: '☁️', nameBn: 'মেঘ' },
];

function makeQuestion(): Question {
  const a = Math.floor(Math.random() * 5) + 1;
  const b = Math.floor(Math.random() * 5) + 1;
  const set = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  return { a, b, ...set };
}

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  while (opts.size < 4) opts.add(Math.floor(Math.random() * 10) + 1);
  return shuffle(Array.from(opts));
}

type BtnState = 'idle' | 'correct' | 'wrong';

export default function AdditionGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [question, setQuestion] = useState<Question>(() => makeQuestion());
  const [options, setOptions] = useState(() => makeOptions(question.a + question.b));
  const [selected, setSelected] = useState<number | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const correct = question.a + question.b;

  const handle = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === correct) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 950); }
    else setTimeout(next, 1300);
  };
  const next = () => {
    const q = makeQuestion();
    setQuestion(q);
    setOptions(makeOptions(q.a + q.b));
    setRoundNum(r => r + 1);
    setSelected(null);
  };

  const state = (n: number): BtnState => selected === null ? 'idle' : n === correct ? 'correct' : n === selected ? 'wrong' : 'idle';
  const getBg = (s: BtnState) => s === 'correct' ? '#DCFCE7' : s === 'wrong' ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (s: BtnState) => s === 'correct' ? '#86EFAC' : s === 'wrong' ? '#FECACA' : '#E5E5E5';
  const getColor = (s: BtnState) => s === 'correct' ? '#166534' : s === 'wrong' ? '#DC2626' : '#0A0A0A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Simple Sums</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>যোগ করো · Ages 4–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' }}>
          {/* Group A */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
            {Array.from({ length: question.a }).map((_, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(150).delay(i * 50)}>
                <Text style={{ fontSize: 36 }}>{question.emoji}</Text>
              </Animated.View>
            ))}
          </View>
          {/* Plus sign */}
          <View style={{ backgroundColor: '#0A0A0A', borderRadius: 14, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
            <Text style={{ color: 'white', fontSize: 26, fontWeight: '900' }}>+</Text>
          </View>
          {/* Group B */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 6 }}>
            {Array.from({ length: question.b }).map((_, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(150).delay(question.a * 50 + i * 50)}>
                <Text style={{ fontSize: 36 }}>{question.emoji}</Text>
              </Animated.View>
            ))}
          </View>
          {/* Equation */}
          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#0A0A0A' }}>{question.a}</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#737373' }}>+</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#0A0A0A' }}>{question.b}</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#737373' }}>=</Text>
            <View style={{ width: 52, height: 52, backgroundColor: '#0A0A0A', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 26, fontWeight: '900' }}>?</Text>
            </View>
          </View>
          <Text style={{ marginTop: 10, fontSize: 13, color: '#737373' }}>{question.a} + {question.b} = কত? / = how many {question.nameBn}?</Text>
        </Animated.View>

        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {options.map(n => {
            const s = state(n);
            const btnScale = useSharedValue(1);
            const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
            return (
              <Animated.View key={n} style={[btnAnim]}>
                <Pressable onPress={() => { btnScale.value = withSequence(withSpring(0.9), withSpring(1)); handle(n); }}
                  disabled={selected !== null}
                  style={{ width: 80, height: 80, backgroundColor: getBg(s), borderWidth: 2, borderColor: getBorder(s), borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: getColor(s) }}>{n}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>

        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === correct ? '#166534' : '#DC2626' }}>
              {selected === correct ? `🎉 সঠিক! ${question.a} + ${question.b} = ${correct}!` : `উত্তর ছিল ${correct}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
