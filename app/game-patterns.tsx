import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Pattern = { sequence: string[]; options: string[]; answer: string; hintBn: string };

const PATTERNS: Pattern[] = [
  { sequence: ['🔴','🔵','🔴','🔵','🔴'], options: ['🔵','🟡','🔴'], answer: '🔵', hintBn: 'লাল-নীল-লাল-নীল...' },
  { sequence: ['🌙','⭐','🌙','⭐','🌙'], options: ['⭐','☀️','🌙'], answer: '⭐', hintBn: 'চাঁদ-তারা-চাঁদ-তারা...' },
  { sequence: ['🐄','🐐','🐄','🐐','🐄'], options: ['🐐','🐕','🐄'], answer: '🐐', hintBn: 'গরু-ছাগল-গরু-ছাগল...' },
  { sequence: ['🟡','🟢','🟡','🟢','🟡'], options: ['🟢','🔵','🟡'], answer: '🟢', hintBn: 'হলুদ-সবুজ-হলুদ-সবুজ...' },
  { sequence: ['🐟','🐠','🐟','🐠','🐟'], options: ['🐠','🦈','🐟'], answer: '🐠', hintBn: 'মাছ-রঙিন মাছ-মাছ...' },
  { sequence: ['🌺','🌿','🌺','🌿','🌺'], options: ['🌿','🌵','🌺'], answer: '🌿', hintBn: 'ফুল-পাতা-ফুল-পাতা...' },
  { sequence: ['🍎','🍌','🍎','🍌','🍎'], options: ['🍌','🍊','🍎'], answer: '🍌', hintBn: 'আপেল-কলা-আপেল-কলা...' },
  { sequence: ['☀️','🌧️','☀️','🌧️','☀️'], options: ['🌧️','❄️','☀️'], answer: '🌧️', hintBn: 'রোদ-বৃষ্টি-রোদ-বৃষ্টি...' },
  { sequence: ['🔺','⬛','🔺','⬛','🔺'], options: ['⬛','⭕','🔺'], answer: '⬛', hintBn: 'ত্রিভুজ-বর্গ-ত্রিভুজ...' },
  { sequence: ['🦁','🐯','🦁','🐯','🦁'], options: ['🐯','🐻','🦁'], answer: '🐯', hintBn: 'সিংহ-বাঘ-সিংহ-বাঘ...' },
  { sequence: ['1️⃣','2️⃣','1️⃣','2️⃣','1️⃣'], options: ['2️⃣','3️⃣','1️⃣'], answer: '2️⃣', hintBn: 'এক-দুই-এক-দুই...' },
  { sequence: ['🚗','✈️','🚗','✈️','🚗'], options: ['✈️','🚂','🚗'], answer: '✈️', hintBn: 'গাড়ি-বিমান-গাড়ি...' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function PatternsGame() {
  const [score, setScore] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffled] = useState(() => shuffle(PATTERNS));
  const round = shuffled[roundIdx % shuffled.length];
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === round.answer) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 900); }
    else setTimeout(next, 1300);
  };
  const next = () => { setRoundIdx(r => r + 1); setSelected(null); };

  const getBg = (opt: string) => !selected ? '#F5F5F5' : opt === round.answer ? '#DCFCE7' : opt === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (opt: string) => !selected ? '#E5E5E5' : opt === round.answer ? '#86EFAC' : opt === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Pattern Complete</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>ধারা সম্পূর্ণ করো · Ages 2–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundIdx}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 13, color: '#737373', marginBottom: 6 }}>ধারা দেখো — Next what comes?</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0A0A0A', marginBottom: 16 }}>{round.hintBn}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
            {round.sequence.map((e, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(200).delay(i * 80)} style={{ backgroundColor: 'white', borderRadius: 14, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E5E5' }}>
                <Text style={{ fontSize: 28 }}>{e}</Text>
              </Animated.View>
            ))}
            <View style={{ backgroundColor: '#0A0A0A', borderRadius: 14, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>?</Text>
            </View>
          </View>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>What comes next? · পরেরটি কী?</Text>
        <Animated.View key={`o-${roundIdx}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 14, justifyContent: 'center' }}>
          {round.options.map(opt => {
            const s = useSharedValue(1);
            const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
            return (
              <Animated.View key={opt} style={[a, { width: 90 }]}>
                <Pressable onPress={() => { s.value = withSequence(withSpring(0.9), withSpring(1)); handle(opt); }}
                  disabled={!!selected} style={{ backgroundColor: getBg(opt), borderWidth: 2, borderColor: getBorder(opt), borderRadius: 20, paddingVertical: 22, alignItems: 'center' }}>
                  <Text style={{ fontSize: 44 }}>{opt}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === round.answer ? '#166534' : '#DC2626' }}>
              {selected === round.answer ? '🎉 সঠিক! Correct!' : `উত্তর ছিল ${round.answer}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundIdx + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
