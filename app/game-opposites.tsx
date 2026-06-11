import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Pair = { wordEn: string; wordBn: string; emoji: string; options: { wordEn: string; wordBn: string; emoji: string; correct: boolean }[] };

const PAIRS: Pair[] = [
  { wordEn: 'Big', wordBn: 'বড়', emoji: '🐘', options: [{ wordEn: 'Small', wordBn: 'ছোট', emoji: '🐭', correct: true }, { wordEn: 'Tall', wordBn: 'লম্বা', emoji: '🦒', correct: false }, { wordEn: 'Fat', wordBn: 'মোটা', emoji: '🐷', correct: false }] },
  { wordEn: 'Hot', wordBn: 'গরম', emoji: '☀️', options: [{ wordEn: 'Cold', wordBn: 'ঠান্ডা', emoji: '❄️', correct: true }, { wordEn: 'Warm', wordBn: 'উষ্ণ', emoji: '🌡️', correct: false }, { wordEn: 'Dry', wordBn: 'শুষ্ক', emoji: '🏜️', correct: false }] },
  { wordEn: 'Day', wordBn: 'দিন', emoji: '☀️', options: [{ wordEn: 'Night', wordBn: 'রাত', emoji: '🌙', correct: true }, { wordEn: 'Noon', wordBn: 'দুপুর', emoji: '🕛', correct: false }, { wordEn: 'Dawn', wordBn: 'ভোর', emoji: '🌅', correct: false }] },
  { wordEn: 'Happy', wordBn: 'খুশি', emoji: '😊', options: [{ wordEn: 'Sad', wordBn: 'দুঃখী', emoji: '😢', correct: true }, { wordEn: 'Angry', wordBn: 'রাগী', emoji: '😠', correct: false }, { wordEn: 'Scared', wordBn: 'ভয়ার্ত', emoji: '😨', correct: false }] },
  { wordEn: 'Fast', wordBn: 'দ্রুত', emoji: '🐆', options: [{ wordEn: 'Slow', wordBn: 'ধীর', emoji: '🐢', correct: true }, { wordEn: 'Strong', wordBn: 'শক্তিশালী', emoji: '💪', correct: false }, { wordEn: 'Loud', wordBn: 'জোরে', emoji: '📢', correct: false }] },
  { wordEn: 'Up', wordBn: 'উপরে', emoji: '⬆️', options: [{ wordEn: 'Down', wordBn: 'নিচে', emoji: '⬇️', correct: true }, { wordEn: 'Left', wordBn: 'বামে', emoji: '⬅️', correct: false }, { wordEn: 'Right', wordBn: 'ডানে', emoji: '➡️', correct: false }] },
  { wordEn: 'Wet', wordBn: 'ভেজা', emoji: '💧', options: [{ wordEn: 'Dry', wordBn: 'শুকনো', emoji: '🏜️', correct: true }, { wordEn: 'Warm', wordBn: 'উষ্ণ', emoji: '🌡️', correct: false }, { wordEn: 'Dark', wordBn: 'অন্ধকার', emoji: '🌑', correct: false }] },
  { wordEn: 'Open', wordBn: 'খোলা', emoji: '📖', options: [{ wordEn: 'Closed', wordBn: 'বন্ধ', emoji: '📕', correct: true }, { wordEn: 'Full', wordBn: 'পূর্ণ', emoji: '🍚', correct: false }, { wordEn: 'Empty', wordBn: 'খালি', emoji: '🪣', correct: false }] },
  { wordEn: 'Clean', wordBn: 'পরিষ্কার', emoji: '✨', options: [{ wordEn: 'Dirty', wordBn: 'নোংরা', emoji: '🗑️', correct: true }, { wordEn: 'Neat', wordBn: 'গুছানো', emoji: '📦', correct: false }, { wordEn: 'Bright', wordBn: 'উজ্জ্বল', emoji: '💡', correct: false }] },
  { wordEn: 'Full', wordBn: 'পূর্ণ', emoji: '🍚', options: [{ wordEn: 'Empty', wordBn: 'খালি', emoji: '🪣', correct: true }, { wordEn: 'Heavy', wordBn: 'ভারী', emoji: '⚖️', correct: false }, { wordEn: 'Fat', wordBn: 'মোটা', emoji: '🐷', correct: false }] },
  { wordEn: 'Loud', wordBn: 'জোরে', emoji: '📢', options: [{ wordEn: 'Quiet', wordBn: 'শান্ত', emoji: '🤫', correct: true }, { wordEn: 'Fast', wordBn: 'দ্রুত', emoji: '⚡', correct: false }, { wordEn: 'Dark', wordBn: 'অন্ধকার', emoji: '🌑', correct: false }] },
  { wordEn: 'Old', wordBn: 'বৃদ্ধ', emoji: '👴', options: [{ wordEn: 'Young', wordBn: 'তরুণ', emoji: '👶', correct: true }, { wordEn: 'Tall', wordBn: 'লম্বা', emoji: '🧍', correct: false }, { wordEn: 'Weak', wordBn: 'দুর্বল', emoji: '😔', correct: false }] },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function OppositesGame() {
  const [score, setScore] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffled] = useState(() => shuffle(PAIRS));
  const round = shuffled[roundIdx % shuffled.length];
  const [opts] = useState(() => round.options); // options already mixed
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
  const getBg = (idx: number) => !selected ? '#F5F5F5' : idx === correctIdx ? '#DCFCE7' : idx === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (idx: number) => !selected ? '#E5E5E5' : idx === correctIdx ? '#86EFAC' : idx === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Opposites</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>বিপরীত শব্দ</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundIdx}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ fontSize: 72, marginBottom: 12 }}>{round.emoji}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 34, fontWeight: '900' }}>{round.wordBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 4 }}>{round.wordEn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 14 }}>বিপরীত শব্দ কোনটি? · What is the opposite?</Text>
        </Animated.View>
        <Animated.View key={`o-${roundIdx}`} entering={FadeInDown.duration(350).delay(80)} style={{ width: '100%', gap: 10 }}>
          {round.options.map((opt, idx) => (
            <Pressable key={idx} onPress={() => handle(idx)}
              style={{ backgroundColor: getBg(idx), borderWidth: 2, borderColor: getBorder(idx), borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 32 }}>{opt.emoji}</Text>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>{opt.wordBn}</Text>
                <Text style={{ fontSize: 13, color: '#737373' }}>{opt.wordEn}</Text>
              </View>
              {selected !== null && idx === correctIdx && <Text style={{ marginLeft: 'auto', fontSize: 20 }}>✅</Text>}
              {selected !== null && idx === selected && !opt.correct && <Text style={{ marginLeft: 'auto', fontSize: 20 }}>❌</Text>}
            </Pressable>
          ))}
        </Animated.View>
        {selected !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: round.options[selected].correct ? '#166534' : '#DC2626' }}>
              {round.options[selected].correct ? '🎉 সঠিক!' : `উত্তর ছিল ${round.options[correctIdx].wordBn} ${round.options[correctIdx].emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundIdx + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
