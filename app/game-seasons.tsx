import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

// Bangladesh has 6 seasons (ষড়ঋতু)
type Season = { emoji: string; nameEn: string; nameBn: string; month: string; clue: string; clueBn: string };

const SEASONS: Season[] = [
  { emoji: '☀️', nameEn: 'Summer (Grishmo)', nameBn: 'গ্রীষ্ম', month: 'Baishakh-Joishtho', clue: 'Very hot, mangoes everywhere!', clueBn: 'খুব গরম, আম পাকে!' },
  { emoji: '🌧️', nameEn: 'Monsoon (Borsha)', nameBn: 'বর্ষা', month: 'Ashar-Shrabon', clue: 'Rain all day, rivers fill up!', clueBn: 'সারাদিন বৃষ্টি, নদীতে জল!' },
  { emoji: '🍂', nameEn: 'Autumn (Shorot)', nameBn: 'শরৎ', month: 'Bhadro-Ashwin', clue: 'Clear skies, white clouds!', clueBn: 'পরিষ্কার আকাশ, সাদা মেঘ!' },
  { emoji: '🌾', nameEn: 'Late Autumn (Hemonto)', nameBn: 'হেমন্ত', month: 'Kartik-Ogrohayon', clue: 'Rice harvest time!', clueBn: 'ধান কাটার সময়!' },
  { emoji: '❄️', nameEn: 'Winter (Sheet)', nameBn: 'শীত', month: 'Poush-Magh', clue: 'Cool and foggy, date palm juice!', clueBn: 'ঠান্ডা কুয়াশা, খেজুর রস!' },
  { emoji: '🌸', nameEn: 'Spring (Bashonto)', nameBn: 'বসন্ত', month: 'Falgun-Choitro', clue: 'Flowers bloom, birds sing!', clueBn: 'ফুল ফোটে, পাখি গায়!' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }
function makeRound(prevEmoji?: string) {
  const pool = prevEmoji ? SEASONS.filter(s => s.emoji !== prevEmoji) : SEASONS;
  const answer = shuffle(pool)[0];
  const opts = shuffle([answer, ...shuffle(SEASONS.filter(s => s.emoji !== answer.emoji)).slice(0, 2)]);
  return { answer, options: opts };
}

export default function SeasonsGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ answer, options }, setRound] = useState(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (s: Season) => {
    if (selected) return;
    setSelected(s.emoji);
    if (s.emoji === answer.emoji) { setScore(sc => sc + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(answer.emoji), 950); }
    else setTimeout(() => next(answer.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };

  const getBg = (s: Season) => !selected ? '#F5F5F5' : s.emoji === answer.emoji ? '#DCFCE7' : s.emoji === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (s: Season) => !selected ? '#E5E5E5' : s.emoji === answer.emoji ? '#86EFAC' : s.emoji === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Seasons of Bangladesh</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>বাংলাদেশের ষড়ঋতু · Ages 3–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>কোন ঋতু? · Which season?</Text>
          <Text style={{ color: '#FCD34D', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>{answer.clueBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center', fontStyle: 'italic' }}>{answer.clue}</Text>
          <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Month: {answer.month}</Text>
          </View>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>সঠিক ঋতুটি বেছে নাও · Pick the right season</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ width: '100%', gap: 10 }}>
          {options.map(s => (
            <Pressable key={s.emoji} onPress={() => handle(s)}
              style={{ backgroundColor: getBg(s), borderWidth: 2, borderColor: getBorder(s), borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 36 }}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>{s.nameBn}</Text>
                <Text style={{ fontSize: 13, color: '#737373' }}>{s.nameEn}</Text>
              </View>
              {selected && s.emoji === answer.emoji && <Text style={{ fontSize: 22 }}>✅</Text>}
              {selected && s.emoji === selected && s.emoji !== answer.emoji && <Text style={{ fontSize: 22 }}>❌</Text>}
            </Pressable>
          ))}
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
