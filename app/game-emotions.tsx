import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Emotion = { emoji: string; nameEn: string; nameBn: string; desc: string; descBn: string };

const EMOTIONS: Emotion[] = [
  { emoji: '😊', nameEn: 'Happy',    nameBn: 'খুশি',     desc: 'You feel good!',          descBn: 'ভালো লাগছে!' },
  { emoji: '😢', nameEn: 'Sad',      nameBn: 'দুঃখী',    desc: 'You want to cry',         descBn: 'কাঁদতে ইচ্ছে করছে' },
  { emoji: '😠', nameEn: 'Angry',    nameBn: 'রাগী',      desc: 'You feel mad',            descBn: 'রাগ লাগছে' },
  { emoji: '😨', nameEn: 'Scared',   nameBn: 'ভয়ার্ত',   desc: 'Something frightened you', descBn: 'ভয় পেয়েছ' },
  { emoji: '😮', nameEn: 'Surprised',nameBn: 'অবাক',      desc: 'That was unexpected!',    descBn: 'অবাক হয়ে গেছ!' },
  { emoji: '🤒', nameEn: 'Sick',     nameBn: 'অসুস্থ',   desc: 'You don\'t feel well',    descBn: 'শরীর খারাপ লাগছে' },
  { emoji: '😴', nameEn: 'Sleepy',   nameBn: 'ঘুমন্ত',   desc: 'You want to sleep',       descBn: 'ঘুম পাচ্ছে' },
  { emoji: '🤩', nameEn: 'Excited',  nameBn: 'উত্তেজিত',  desc: 'You can\'t wait!',        descBn: 'অপেক্ষা করতে পারছ না!' },
  { emoji: '😍', nameEn: 'Loving',   nameBn: 'ভালোবাসা', desc: 'You feel love',           descBn: 'ভালোবাসা অনুভব করছ' },
  { emoji: '😤', nameEn: 'Frustrated',nameBn: 'বিরক্ত',  desc: 'Things aren\'t going right',descBn: 'কিছুই ঠিকমতো হচ্ছে না' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(prevEmoji?: string) {
  const pool = prevEmoji ? EMOTIONS.filter(e => e.emoji !== prevEmoji) : EMOTIONS;
  const answer = shuffle(pool)[0];
  const opts = shuffle([answer, ...shuffle(EMOTIONS.filter(e => e.emoji !== answer.emoji)).slice(0, 2)]);
  return { answer, options: opts };
}

type BtnState = 'idle' | 'correct' | 'wrong';

export default function EmotionsGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ answer, options }, setRound] = useState(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (e: Emotion) => {
    if (selected) return;
    setSelected(e.emoji);
    if (e.emoji === answer.emoji) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(answer.emoji), 900); }
    else setTimeout(() => next(answer.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };
  const state = (e: Emotion): BtnState => !selected ? 'idle' : e.emoji === answer.emoji ? 'correct' : e.emoji === selected ? 'wrong' : 'idle';
  const getBg = (s: BtnState) => s === 'correct' ? '#DCFCE7' : s === 'wrong' ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (s: BtnState) => s === 'correct' ? '#86EFAC' : s === 'wrong' ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Emotions</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>অনুভূতি · Ages 2–5y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#0A0A0A', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ fontSize: 96, marginBottom: 16 }}>{answer.emoji}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 }}>{answer.descBn}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center' }}>{answer.desc}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 14 }}>এই অনুভূতির নাম কী? · What is this feeling?</Text>
        </Animated.View>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {options.map(e => {
            const s = state(e);
            const btnScale = useSharedValue(1);
            const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
            return (
              <Animated.View key={e.emoji} style={[btnAnim, { width: '30%' }]}>
                <Pressable onPress={() => { btnScale.value = withSequence(withSpring(0.9), withSpring(1)); handle(e); }}
                  disabled={!!selected} style={{ backgroundColor: getBg(s), borderWidth: 2, borderColor: getBorder(s), borderRadius: 20, paddingVertical: 20, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 44 }}>{e.emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A', textAlign: 'center' }}>{e.nameBn}</Text>
                  <Text style={{ fontSize: 11, color: '#737373' }}>{e.nameEn}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
        {selected && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === answer.emoji ? '#166534' : '#DC2626' }}>
              {selected === answer.emoji ? `🎉 সঠিক! এটি ${answer.nameBn}!` : `উত্তর ছিল ${answer.nameBn} ${answer.emoji}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
