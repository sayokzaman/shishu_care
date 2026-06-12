import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Part = { emoji: string; nameEn: string; nameBn: string };
type Round = { question: string; questionBn: string; answer: Part; options: Part[] };

const PARTS: Part[] = [
  { emoji: '👁️', nameEn: 'Eye',     nameBn: 'চোখ' },
  { emoji: '👂', nameEn: 'Ear',     nameBn: 'কান' },
  { emoji: '👃', nameEn: 'Nose',    nameBn: 'নাক' },
  { emoji: '👄', nameEn: 'Mouth',   nameBn: 'মুখ' },
  { emoji: '🦷', nameEn: 'Teeth',   nameBn: 'দাঁত' },
  { emoji: '✋', nameEn: 'Hand',    nameBn: 'হাত' },
  { emoji: '🦶', nameEn: 'Foot',    nameBn: 'পা' },
  { emoji: '💇', nameEn: 'Hair',    nameBn: 'চুল' },
  { emoji: '🤰', nameEn: 'Tummy',   nameBn: 'পেট' },
  { emoji: '💪', nameEn: 'Arm',     nameBn: 'বাহু' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(prevEmoji?: string): Round {
  const pool = prevEmoji ? PARTS.filter(p => p.emoji !== prevEmoji) : PARTS;
  const answer = shuffle(pool)[0];
  const distractors = shuffle(PARTS.filter(p => p.emoji !== answer.emoji)).slice(0, 2);
  const options = shuffle([answer, ...distractors]);
  return { question: `Touch your ${answer.nameEn}!`, questionBn: `তোমার ${answer.nameBn} দেখাও!`, answer, options };
}

type BtnState = 'idle' | 'correct' | 'wrong';

export default function BodyPartsGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round>(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (part: Part) => {
    if (selected) return;
    setSelected(part.emoji);
    if (part.emoji === round.answer.emoji) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(round.answer.emoji), 900); }
    else setTimeout(() => next(round.answer.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };
  const state = (p: Part): BtnState => !selected ? 'idle' : p.emoji === round.answer.emoji ? 'correct' : p.emoji === selected ? 'wrong' : 'idle';
  const getBg = (s: BtnState) => s === 'correct' ? '#DCFCE7' : s === 'wrong' ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (s: BtnState) => s === 'correct' ? '#86EFAC' : s === 'wrong' ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Body Parts</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>শরীরের অঙ্গ · Ages 1–3y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: '#FCD34D', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 4 }}>{round.questionBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, textAlign: 'center' }}>{round.question}</Text>
          <Text style={{ fontSize: 80, marginTop: 20 }}>{round.answer.emoji}</Text>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>Tap the correct body part · সঠিক অঙ্গটি বেছে নাও</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {round.options.map(part => {
            const s = state(part);
            const btnScale = useSharedValue(1);
            const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
            return (
              <Animated.View key={part.emoji} style={[btnAnim, { width: '30%' }]}>
                <Pressable onPress={() => { btnScale.value = withSequence(withSpring(0.9), withSpring(1)); handle(part); }}
                  disabled={!!selected} style={{ backgroundColor: getBg(s), borderWidth: 2, borderColor: getBorder(s), borderRadius: 20, paddingVertical: 20, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 44 }}>{part.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A' }}>{part.nameBn}</Text>
                  <Text style={{ fontSize: 11, color: '#737373' }}>{part.nameEn}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === round.answer.emoji ? '#166534' : '#DC2626' }}>
              {selected === round.answer.emoji ? `🎉 সঠিক! ${round.answer.nameBn}!` : `উত্তর ছিল ${round.answer.nameBn} ${round.answer.emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
