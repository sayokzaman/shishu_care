import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Color = { emoji: string; nameEn: string; nameBn: string; hex: string };

const COLORS: Color[] = [
  { emoji: '🔴', nameEn: 'Red',    nameBn: 'লাল',    hex: '#EF4444' },
  { emoji: '🔵', nameEn: 'Blue',   nameBn: 'নীল',    hex: '#3B82F6' },
  { emoji: '🟡', nameEn: 'Yellow', nameBn: 'হলুদ',   hex: '#EAB308' },
  { emoji: '🟢', nameEn: 'Green',  nameBn: 'সবুজ',   hex: '#22C55E' },
  { emoji: '🟠', nameEn: 'Orange', nameBn: 'কমলা',   hex: '#F97316' },
  { emoji: '🟣', nameEn: 'Purple', nameBn: 'বেগুনি',  hex: '#A855F7' },
  { emoji: '⚫', nameEn: 'Black',  nameBn: 'কালো',   hex: '#171717' },
  { emoji: '⚪', nameEn: 'White',  nameBn: 'সাদা',   hex: '#E5E5E5' },
  { emoji: '🩷', nameEn: 'Pink',   nameBn: 'গোলাপি', hex: '#EC4899' },
  { emoji: '🟤', nameEn: 'Brown',  nameBn: 'বাদামি',  hex: '#92400E' },
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(prevEmoji?: string) {
  const pool = prevEmoji ? COLORS.filter(c => c.emoji !== prevEmoji) : COLORS;
  const ans = shuffle(pool)[0];
  const opts = shuffle([ans, ...shuffle(COLORS.filter(c => c.emoji !== ans.emoji)).slice(0, 2)]);
  return { answer: ans, options: opts };
}

type BtnState = 'idle' | 'correct' | 'wrong';

function ColorBtn({ color, state, onPress }: { color: Color; state: BtnState; onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const border = state === 'correct' ? '#86EFAC' : state === 'wrong' ? '#FECACA' : '#E5E5E5';
  const bg = state === 'correct' ? '#DCFCE7' : state === 'wrong' ? '#FEE2E2' : '#F8F8F8';
  return (
    <Animated.View style={[anim, { width: '30%' }]}>
      <Pressable onPress={() => { scale.value = withSequence(withSpring(0.9), withSpring(1)); onPress(); }}
        disabled={state !== 'idle'}
        style={{ backgroundColor: bg, borderWidth: 2, borderColor: border, borderRadius: 18, paddingVertical: 18, alignItems: 'center', gap: 6 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.hex, borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)' }} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>{color.nameBn}</Text>
        <Text style={{ fontSize: 11, color: '#737373' }}>{color.nameEn}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ColorsGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [{ answer, options }, setRound] = useState(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (c: Color) => {
    if (selected) return;
    setSelected(c.emoji);
    if (c.emoji === answer.emoji) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(() => next(answer.emoji), 900); }
    else setTimeout(() => next(answer.emoji), 1300);
  };
  const next = (prev: string) => { setRound(makeRound(prev)); setRoundNum(r => r + 1); setSelected(null); };
  const state = (c: Color): BtnState => !selected ? 'idle' : c.emoji === answer.emoji ? 'correct' : c.emoji === selected ? 'wrong' : 'idle';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Colour Quiz</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>রঙ চেনো</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: answer.hex, alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: answer.hex, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: 'white', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 }}>এই রঙের নাম কী?</Text>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>What colour is this? · রঙটির নাম বলো</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' }}>
          {options.map(c => <ColorBtn key={c.emoji} color={c} state={state(c)} onPress={() => handle(c)} />)}
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
