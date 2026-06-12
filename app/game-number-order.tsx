import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

// Show 4 numbers in wrong order → tap them in order 1→2→3→4
type Round = { numbers: number[]; emoji: string; nameBn: string };

const EMOJI_SETS: { emoji: string; nameBn: string }[] = [
  { emoji: '🥭', nameBn: 'আম' }, { emoji: '🐟', nameBn: 'মাছ' }, { emoji: '⭐', nameBn: 'তারা' },
  { emoji: '🌺', nameBn: 'ফুল' }, { emoji: '🍌', nameBn: 'কলা' }, { emoji: '🐄', nameBn: 'গরু' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(ageMonths: number): Round {
  const max = ageMonths >= 48 ? 6 : ageMonths >= 36 ? 5 : 4;
  const numbers = shuffle(Array.from({ length: max }, (_, i) => i + 1));
  const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  return { numbers, ...set };
}

export default function NumberOrderGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [ageMonths] = useState(42);
  const [round, setRound] = useState<Round>(() => makeRound(ageMonths));
  const [tapped, setTapped] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (n: number) => {
    if (tapped.includes(n)) return;
    const expected = tapped.length + 1;
    if (n === expected) {
      const newTapped = [...tapped, n];
      setTapped(newTapped);
      if (newTapped.length === round.numbers.length) {
        setScore(s => s + 1);
        scoreScale.value = withSequence(withSpring(1.4), withSpring(1));
        setTimeout(next, 1000);
      }
    } else {
      setFailed(true);
      setTimeout(() => { setTapped([]); setFailed(false); }, 800);
    }
  };
  const next = () => { setRound(makeRound(ageMonths)); setRoundNum(r => r + 1); setTapped([]); setFailed(false); };

  const getNumBg = (n: number) => {
    if (tapped.includes(n)) return '#DCFCE7';
    if (failed && !tapped.includes(n)) return '#FEE2E2';
    return '#F5F5F5';
  };
  const getNumBorder = (n: number) => {
    if (tapped.includes(n)) return '#86EFAC';
    if (failed && !tapped.includes(n)) return '#FECACA';
    return '#E5E5E5';
  };

  const nextExpected = tapped.length + 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Number Order</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>সংখ্যার ক্রম · Ages 3–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>ছোট থেকে বড় সাজাও · Tap in order 1→{round.numbers.length}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 22, fontWeight: '900', marginBottom: 8 }}>
            {tapped.length === round.numbers.length ? '🎉 সম্পূর্ণ! Complete!' : `পরেরটি: ${nextExpected} ${round.emoji}`}
          </Text>
          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {round.numbers.map((_, i) => (
              <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < tapped.length ? '#FCD34D' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </View>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>
          Tap numbers from smallest to biggest
        </Text>
        <Animated.View key={`n-${roundNum}`} entering={FadeInDown.duration(350).delay(80)}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '100%' }}>
          {round.numbers.map(n => {
            const s = useSharedValue(1);
            const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
            return (
              <Animated.View key={n} style={[a]}>
                <Pressable onPress={() => { s.value = withSequence(withSpring(0.9), withSpring(1)); handle(n); }}
                  disabled={tapped.includes(n)}
                  style={{ width: 80, height: 80, backgroundColor: getNumBg(n), borderWidth: 2, borderColor: getNumBorder(n), borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 26, fontWeight: '900', color: tapped.includes(n) ? '#166534' : '#0A0A0A' }}>{n}</Text>
                  <Text style={{ fontSize: 18 }}>{tapped.includes(n) ? '✅' : round.emoji}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {failed && (
          <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#DC2626', textAlign: 'center' }}>
              ❌ পরেরটি হবে {nextExpected} {round.emoji} — চেষ্টা করো!
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
