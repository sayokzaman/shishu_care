import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Round = { items: string[]; oddIndex: number; hint: string; hintBn: string };

const ROUNDS: Round[] = [
  { items: ['🐄','🐐','🐕','🍌'], oddIndex: 3, hint: 'Three are animals', hintBn: 'তিনটি প্রাণী' },
  { items: ['🍎','🍌','🏀','🍊'], oddIndex: 2, hint: 'Three are fruits', hintBn: 'তিনটি ফল' },
  { items: ['🚗','✈️','🐟','🚂'], oddIndex: 2, hint: 'Three are vehicles', hintBn: 'তিনটি যানবাহন' },
  { items: ['📚','✏️','📏','🍕'], oddIndex: 3, hint: 'Three are school items', hintBn: 'তিনটি স্কুলের জিনিস' },
  { items: ['🌧️','☀️','🌊','❄️'], oddIndex: 2, hint: 'Three are weather', hintBn: 'তিনটি আবহাওয়া' },
  { items: ['🔴','🟡','🔵','🐘'], oddIndex: 3, hint: 'Three are colours', hintBn: 'তিনটি রঙ' },
  { items: ['👕','👗','🎒','👖'], oddIndex: 2, hint: 'Three are clothes', hintBn: 'তিনটি পোশাক' },
  { items: ['🍚','🍛','🎸','🍜'], oddIndex: 2, hint: 'Three are food', hintBn: 'তিনটি খাবার' },
  { items: ['🌺','🌸','🌻','🐸'], oddIndex: 3, hint: 'Three are flowers', hintBn: 'তিনটি ফুল' },
  { items: ['1️⃣','2️⃣','3️⃣','🐱'], oddIndex: 3, hint: 'Three are numbers', hintBn: 'তিনটি সংখ্যা' },
  { items: ['🏠','🏫','🐔','🏥'], oddIndex: 2, hint: 'Three are buildings', hintBn: 'তিনটি ভবন' },
  { items: ['🥭','🍈','🍋','🎵'], oddIndex: 3, hint: 'Three are fruits', hintBn: 'তিনটি ফল' },
  { items: ['🐯','🦁','🐻','🌴'], oddIndex: 3, hint: 'Three are animals', hintBn: 'তিনটি প্রাণী' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function OddOneOutGame() {
  const [score, setScore] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const shuffledRounds = useState(() => shuffle(ROUNDS))[0];
  const round = shuffledRounds[roundIdx % shuffledRounds.length];
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === round.oddIndex) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 900); }
    else setTimeout(next, 1300);
  };
  const next = () => { setRoundIdx(r => r + 1); setSelected(null); };

  const getBg = (idx: number) => {
    if (selected === null) return '#F5F5F5';
    if (idx === round.oddIndex) return '#DCFCE7';
    if (idx === selected) return '#FEE2E2';
    return '#F5F5F5';
  };
  const getBorder = (idx: number) => {
    if (selected === null) return '#E5E5E5';
    if (idx === round.oddIndex) return '#86EFAC';
    if (idx === selected) return '#FECACA';
    return '#E5E5E5';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Odd One Out</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>বেমানান কোনটি?</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`h-${roundIdx}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>বেমানানটি খুঁজে বের করো</Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center' }}>{round.hintBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>{round.hint}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 12 }}>Which one does NOT belong?</Text>
        </Animated.View>
        <Animated.View key={`i-${roundIdx}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '100%' }}>
          {round.items.map((emoji, idx) => {
            const itemScale = useSharedValue(1);
            return (
              <Pressable key={idx} onPress={() => handle(idx)}
                style={{ width: '44%', backgroundColor: getBg(idx), borderWidth: 2, borderColor: getBorder(idx), borderRadius: 20, paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 52 }}>{emoji}</Text>
                {selected !== null && idx === round.oddIndex && <Text style={{ fontSize: 20, marginTop: 6 }}>✅</Text>}
                {selected !== null && idx === selected && idx !== round.oddIndex && <Text style={{ fontSize: 20, marginTop: 6 }}>❌</Text>}
              </Pressable>
            );
          })}
        </Animated.View>
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === round.oddIndex ? '#166534' : '#DC2626' }}>
              {selected === round.oddIndex ? '🎉 সঠিক!' : `উত্তর ছিল ${round.items[round.oddIndex]}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundIdx + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
