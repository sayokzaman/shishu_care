import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Round = { items: string[]; hiddenIdx: number; options: string[] };

const SETS: string[][] = [
  ['🥭','🍌','🍈','🍋'],
  ['🐄','🐐','🐟','🦆'],
  ['🚗','✈️','🚢','🚲'],
  ['🔴','🔵','🟡','🟢'],
  ['⭕','⬛','🔺','⭐'],
  ['👁️','👂','👃','👄'],
  ['☀️','🌧️','❄️','🌙'],
  ['1️⃣','2️⃣','3️⃣','4️⃣'],
  ['👕','👗','👖','🧢'],
  ['🌺','🌿','🌊','⛰️'],
  ['📚','✏️','📏','📐'],
  ['🏠','🏫','🏥','🕌'],
];

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

function makeRound(prevHidden?: string): Round {
  const setList = prevHidden ? SETS : SETS;
  const items = shuffle(setList)[0];
  const hiddenIdx = Math.floor(Math.random() * items.length);
  const hidden = items[hiddenIdx];
  // options: correct + 2 random from other items
  const others = shuffle(items.filter((_, i) => i !== hiddenIdx)).slice(0, 2);
  const extraPool = SETS.flat().filter(e => !items.includes(e));
  const extra = shuffle(extraPool)[0];
  const options = shuffle([hidden, others[0] || extra, others[1] || shuffle(extraPool)[1]]);
  return { items, hiddenIdx, options };
}

export default function MissingGame() {
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(0);
  const [round, setRound] = useState<Round>(() => makeRound());
  const [selected, setSelected] = useState<string | null>(null);
  const scoreScale = useSharedValue(1);
  const scoreAnim = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }));

  const handle = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = round.items[round.hiddenIdx];
    if (opt === correct) { setScore(s => s + 1); scoreScale.value = withSequence(withSpring(1.4), withSpring(1)); setTimeout(next, 900); }
    else setTimeout(next, 1300);
  };
  const next = () => { setRound(makeRound()); setRoundNum(r => r + 1); setSelected(null); };

  const correct = round.items[round.hiddenIdx];
  const getBg = (opt: string) => !selected ? '#F5F5F5' : opt === correct ? '#DCFCE7' : opt === selected ? '#FEE2E2' : '#F5F5F5';
  const getBorder = (opt: string) => !selected ? '#E5E5E5' : opt === correct ? '#86EFAC' : opt === selected ? '#FECACA' : '#E5E5E5';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>What's Missing?</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>কী নেই? · Ages 1.5–4y</Text>
        </View>
        <Animated.View style={[scoreAnim, { backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
          <Star size={13} color="#FCD34D" fill="#FCD34D" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{score}</Text>
        </Animated.View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: 'center' }}>
        <Animated.View key={`q-${roundNum}`} entering={FadeInDown.duration(350)} style={{ backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 14, color: '#737373', marginBottom: 16 }}>কোনটি নেই? · Which one is missing?</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {round.items.map((emoji, idx) => (
              <Animated.View key={idx} entering={FadeInDown.duration(200).delay(idx * 80)}
                style={{ width: 68, height: 68, backgroundColor: idx === round.hiddenIdx ? '#0A0A0A' : 'white', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: idx === round.hiddenIdx ? '#0A0A0A' : '#E5E5E5' }}>
                {idx === round.hiddenIdx
                  ? <Text style={{ fontSize: 28, color: 'white', fontWeight: '900' }}>?</Text>
                  : <Text style={{ fontSize: 36 }}>{emoji}</Text>}
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        <Text style={{ fontSize: 14, color: '#737373', marginBottom: 20 }}>Which emoji is hiding? · কোন emoji লুকিয়ে আছে?</Text>
        <Animated.View key={`o-${roundNum}`} entering={FadeInDown.duration(350).delay(80)} style={{ flexDirection: 'row', gap: 14, justifyContent: 'center' }}>
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
            <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: selected === correct ? '#166534' : '#DC2626' }}>
              {selected === correct ? `🎉 সঠিক! ${correct}` : `উত্তর ছিল ${correct}`}
            </Text>
          </Animated.View>
        )}
        <Text style={{ marginTop: 32, fontSize: 12, color: '#B0B0B0' }}>Round {roundNum + 1}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
