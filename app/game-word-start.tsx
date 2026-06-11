import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

// Each question: show letter → pick which item starts with it
type Q = { letter: string; letterBn: string; options: { emoji: string; word: string; wordBn: string; correct: boolean }[] };

const QUESTIONS: Q[] = [
  { letter: 'A', letterBn: 'অ', options: [{ emoji: '🥭', word: 'Aam', wordBn: 'আম', correct: true }, { emoji: '🍌', word: 'Kola', wordBn: 'কলা', correct: false }, { emoji: '🍊', word: 'Komola', wordBn: 'কমলা', correct: false }] },
  { letter: 'B', letterBn: 'ব', options: [{ emoji: '🐯', word: 'Bagh', wordBn: 'বাঘ', correct: true }, { emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: false }, { emoji: '🐘', word: 'Hathi', wordBn: 'হাতি', correct: false }] },
  { letter: 'K', letterBn: 'ক', options: [{ emoji: '🍌', word: 'Kola', wordBn: 'কলা', correct: true }, { emoji: '🥭', word: 'Aam', wordBn: 'আম', correct: false }, { emoji: '🐟', word: 'Mach', wordBn: 'মাছ', correct: false }] },
  { letter: 'M', letterBn: 'ম', options: [{ emoji: '🐟', word: 'Mach', wordBn: 'মাছ', correct: true }, { emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: false }, { emoji: '🍌', word: 'Kola', wordBn: 'কলা', correct: false }] },
  { letter: 'N', letterBn: 'ন', options: [{ emoji: '🌊', word: 'Nodi', wordBn: 'নদী', correct: true }, { emoji: '🌙', word: 'Chand', wordBn: 'চাঁদ', correct: false }, { emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: false }] },
  { letter: 'P', letterBn: 'প', options: [{ emoji: '🦜', word: 'Pakhi', wordBn: 'পাখি', correct: true }, { emoji: '🐟', word: 'Mach', wordBn: 'মাছ', correct: false }, { emoji: '🌺', word: 'Ful', wordBn: 'ফুল', correct: false }] },
  { letter: 'F', letterBn: 'ফ', options: [{ emoji: '🌺', word: 'Ful', wordBn: 'ফুল', correct: true }, { emoji: '🥭', word: 'Aam', wordBn: 'আম', correct: false }, { emoji: '🐟', word: 'Mach', wordBn: 'মাছ', correct: false }] },
  { letter: 'G', letterBn: 'গ', options: [{ emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: true }, { emoji: '🦜', word: 'Pakhi', wordBn: 'পাখি', correct: false }, { emoji: '🌊', word: 'Nodi', wordBn: 'নদী', correct: false }] },
  { letter: 'C', letterBn: 'চ', options: [{ emoji: '🌙', word: 'Chand', wordBn: 'চাঁদ', correct: true }, { emoji: '🥭', word: 'Aam', wordBn: 'আম', correct: false }, { emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: false }] },
  { letter: 'S', letterBn: 'স', options: [{ emoji: '☀️', word: 'Surjo', wordBn: 'সূর্য', correct: true }, { emoji: '🌙', word: 'Chand', wordBn: 'চাঁদ', correct: false }, { emoji: '🌊', word: 'Nodi', wordBn: 'নদী', correct: false }] },
  { letter: 'H', letterBn: 'হ', options: [{ emoji: '🐘', word: 'Hathi', wordBn: 'হাতি', correct: true }, { emoji: '🐄', word: 'Goru', wordBn: 'গরু', correct: false }, { emoji: '🐯', word: 'Bagh', wordBn: 'বাঘ', correct: false }] },
  { letter: 'D', letterBn: 'দ', options: [{ emoji: '🥛', word: 'Doodh', wordBn: 'দুধ', correct: true }, { emoji: '🥭', word: 'Aam', wordBn: 'আম', correct: false }, { emoji: '🍌', word: 'Kola', wordBn: 'কলা', correct: false }] },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function WordStartGame() {
  const [score, setScore] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffled] = useState(() => shuffle(QUESTIONS));
  const round = shuffled[roundIdx % shuffled.length];
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (round.options[idx].correct) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 900); }
    else setTimeout(next, 1300);
  };
  const next = () => { setRoundIdx(r => r + 1); setSelected(null); };
  const correctIdx = round.options.findIndex(o => o.correct);
  const getBg = (idx: number) => selected === null ? '#F5F5F5' : idx === correctIdx ? '#DCFCE7' : idx === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (idx: number) => selected === null ? '#E5E5E5' : idx === correctIdx ? '#86EFAC' : idx === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Word Starter</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>কোন অক্ষর দিয়ে শুরু? · Ages 3–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundIdx}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>এই অক্ষর দিয়ে শুরু · Starts with this letter</Text>
          <Text style={{ color: '#FCD34D', fontSize: 80, fontWeight: '900', lineHeight: 96 }}>{round.letterBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 36, fontWeight: '800', marginTop: 4 }}>{round.letter}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 14 }}>কোন শব্দটি এই অক্ষর দিয়ে শুরু?</Text>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>Which word starts with this letter?</Text>
        <Animated.View key={`o-${roundIdx}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {round.options.map((opt, idx) => {
            const s = useSharedValue(1);
            const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
            return (
              <Animated.View key={idx} style={[a, { width: '30%' }]}>
                <Pressable onPress={() => { s.value = withSequence(withSpring(0.9), withSpring(1)); handle(idx); }}
                  disabled={selected !== null} style={{ backgroundColor: getBg(idx), borderWidth: 2, borderColor: getBorder(idx), borderRadius: 20, paddingVertical: 20, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 44 }}>{opt.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#0A0A0A', textAlign: 'center' }}>{opt.wordBn}</Text>
                  <Text style={{ fontSize: 11, color: '#737373' }}>{opt.word}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: round.options[selected].correct ? '#166534' : '#DC2626' }}>
              {round.options[selected].correct ? `🎉 সঠিক! "${round.options[correctIdx].wordBn}"!` : `উত্তর ছিল ${round.options[correctIdx].wordBn} ${round.options[correctIdx].emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundIdx + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
