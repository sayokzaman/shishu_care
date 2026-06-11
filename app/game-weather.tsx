import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Weather = { emoji: string; nameEn: string; nameBn: string; clue: string; clueBn: string };

const WEATHERS: Weather[] = [
  { emoji: '☀️', nameEn: 'Sunny',  nameBn: 'রোদেলা',  clue: 'Bright and warm outside',        clueBn: 'বাইরে উজ্জ্বল ও গরম' },
  { emoji: '🌧️', nameEn: 'Rainy',  nameBn: 'বৃষ্টি',   clue: 'Water falls from the sky',       clueBn: 'আকাশ থেকে পানি পড়ছে' },
  { emoji: '❄️', nameEn: 'Cold',   nameBn: 'শীতল',    clue: 'Very chilly, wear your coat!',   clueBn: 'খুব ঠান্ডা, গরম জামা পরো!' },
  { emoji: '⛈️', nameEn: 'Stormy', nameBn: 'ঝড়ো',    clue: 'Thunder and lightning!',         clueBn: 'বজ্রপাত ও বিদ্যুৎ চমকাচ্ছে!' },
  { emoji: '🌫️', nameEn: 'Foggy',  nameBn: 'কুয়াশা',  clue: 'Hard to see far away',          clueBn: 'দূরে দেখা যাচ্ছে না' },
  { emoji: '🌈', nameEn: 'Rainbow',nameBn: 'রংধনু',   clue: 'After rain, colours in the sky', clueBn: 'বৃষ্টির পরে আকাশে রঙ' },
  { emoji: '🌬️', nameEn: 'Windy',  nameBn: 'ঝোড়ো হাওয়া', clue: 'Strong air blows things',  clueBn: 'জোরে বাতাস বইছে' },
  { emoji: '☁️', nameEn: 'Cloudy', nameBn: 'মেঘলা',   clue: 'Grey clouds cover the sun',     clueBn: 'মেঘ সূর্য ঢেকে রেখেছে' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }
function makeRound(prevEmoji?: string) {
  const pool = prevEmoji ? WEATHERS.filter(w => w.emoji !== prevEmoji) : WEATHERS;
  const answer = shuffle(pool)[0];
  const opts = shuffle([answer, ...shuffle(WEATHERS.filter(w => w.emoji !== answer.emoji)).slice(0, 2)]);
  return { answer, options: opts };
}

export default function WeatherGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ answer, options }, setRound] = useState(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (w: Weather) => {
    if (selected) return;
    setSelected(w.emoji);
    if (w.emoji === answer.emoji) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(answer.emoji), 900); }
    else setTimeout(() => next(answer.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };

  const getBg = (w: Weather) => !selected ? '#F5F5F5' : w.emoji === answer.emoji ? '#DCFCE7' : w.emoji === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (w: Weather) => !selected ? '#E5E5E5' : w.emoji === answer.emoji ? '#86EFAC' : w.emoji === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Weather Quiz</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>আবহাওয়া · Ages 2–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>আবহাওয়া বর্ণনা · Weather clue</Text>
          <Text style={{ color: '#FCD34D', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>{answer.clueBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center' }}>{answer.clue}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 14 }}>এটি কোন আবহাওয়া? · What weather is this?</Text>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>Tap the matching weather</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {options.map(w => {
            const s = useSharedValue(1);
            const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
            return (
              <Animated.View key={w.emoji} style={[a, { width: '30%' }]}>
                <Pressable onPress={() => { s.value = withSequence(withSpring(0.9), withSpring(1)); handle(w); }}
                  disabled={!!selected} style={{ backgroundColor: getBg(w), borderWidth: 2, borderColor: getBorder(w), borderRadius: 20, paddingVertical: 22, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 44 }}>{w.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A', textAlign: 'center' }}>{w.nameBn}</Text>
                  <Text style={{ fontSize: 11, color: '#737373' }}>{w.nameEn}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === answer.emoji ? '#166534' : '#DC2626' }}>
              {selected === answer.emoji ? `🎉 সঠিক! ${answer.nameBn}!` : `উত্তর ছিল ${answer.nameBn} ${answer.emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
