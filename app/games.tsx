import { Text } from '@/components/ui/text';
import { getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Lightbulb, RefreshCw, Zap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type AgeBracket = 'prenatal' | '0-1m' | '1-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';

const FUN_FACTS: string[] = [
  'Babies can recognise their mother\'s voice from inside the womb.',
  'A newborn\'s brain doubles in size in the first year.',
  'Singing to your baby helps develop language faster.',
  'Babies are born with 300 bones; adults have 206.',
  'Tummy time helps prevent flat head and builds neck strength.',
  'Reading aloud to infants wires the brain for language.',
  'Babies understand "no" by about 9 months.',
  'Play is the most important work of early childhood.',
  'Eye contact and smiling are the foundation of communication.',
  'A 2-year-old learns about 10 new words every day.',
  'Children learn languages more easily before age 7.',
  'Dancing with your toddler improves balance and coordination.',
];

type PuzzleGame = { emojis: string[]; answer: string; question: string; };

const PUZZLES_BY_BRACKET: Record<string, PuzzleGame[]> = {
  prenatal: [
    { emojis: ['🤱', '💊', '🏥'], answer: '1', question: 'Which one is the doctor?' },
  ],
  '0-1m': [
    { emojis: ['🌞', '🌙', '⭐'], answer: '0', question: 'Which one is the sun?' },
  ],
  '1-6m': [
    { emojis: ['🐱', '🐶', '🐸'], answer: '1', question: 'Which one says "woof"?' },
    { emojis: ['🍌', '🍎', '🍊'], answer: '0', question: 'Which one is yellow?' },
  ],
  '6-12m': [
    { emojis: ['🍼', '🧸', '🎈'], answer: '0', question: 'Baby drinks from the?' },
    { emojis: ['🌧️', '☀️', '❄️'], answer: '1', question: 'Which one is bright and warm?' },
    { emojis: ['🐘', '🐭', '🦁'], answer: '0', question: 'Which one is the biggest?' },
  ],
  '1-2y': [
    { emojis: ['🔴', '🟡', '🔵'], answer: '0', question: 'Point to red!' },
    { emojis: ['🐓', '🐟', '🐢'], answer: '0', question: 'Which one says "cluck cluck"?' },
    { emojis: ['🌳', '🌸', '🌵'], answer: '2', question: 'Which one needs very little water?' },
    { emojis: ['🚗', '✈️', '🚂'], answer: '1', question: 'Which one flies in the sky?' },
  ],
  '2-3y': [
    { emojis: ['🦁', '🐯', '🐻'], answer: '2', question: 'Which one is a bear?' },
    { emojis: ['⬛', '🔵', '🔺'], answer: '2', question: 'Which one is a triangle?' },
    { emojis: ['🌊', '🔥', '🌬️'], answer: '1', question: 'Which one is hot?' },
    { emojis: ['🍕', '🍰', '🥗'], answer: '2', question: 'Which one has vegetables?' },
  ],
  '3-5y': [
    { emojis: ['🦋', '🐛', '🥚'], answer: '2', question: 'Which comes first in a butterfly\'s life?' },
    { emojis: ['🌑', '🌓', '🌕'], answer: '2', question: 'Which is a full moon?' },
    { emojis: ['🔢', '🔡', '🎵'], answer: '0', question: 'Which is for counting?' },
    { emojis: ['☁️', '💧', '🌊'], answer: '1', question: 'Rain falls as?' },
    { emojis: ['🌍', '⭐', '🌙'], answer: '0', question: 'Which one do we live on?' },
  ],
};

function PuzzleCard({ puzzle, onCorrect }: { puzzle: PuzzleGame; onCorrect: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === parseInt(puzzle.answer);
    if (correct) { scale.value = withSequence(withSpring(1.08), withSpring(1)); setTimeout(onCorrect, 600); }
    else { scale.value = withSequence(withTiming(0.96), withSpring(1)); }
  };

  return (
    <Animated.View style={[style]}>
      <View style={{ backgroundColor: '#F5F5F5', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0A0A0A', marginBottom: 20, textAlign: 'center' }}>{puzzle.question}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {puzzle.emojis.map((emoji, idx) => {
            const isSelected = selected === idx;
            const isAnswer = idx === parseInt(puzzle.answer);
            let bg = '#FFFFFF';
            let border = '#E5E5E5';
            if (selected !== null) {
              if (isAnswer) { bg = '#ECFDF5'; border = '#6EE7B7'; }
              else if (isSelected) { bg = '#FEF2F2'; border = '#FECACA'; }
            }
            return (
              <Pressable key={idx} onPress={() => handleSelect(idx)} style={{ width: 80, height: 80, borderRadius: 18, backgroundColor: bg, borderWidth: 2, borderColor: border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36 }}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
        {selected !== null && (
          <Text style={{ marginTop: 14, fontSize: 14, fontWeight: '700', color: selected === parseInt(puzzle.answer) ? '#0A0A0A' : '#DC2626' }}>
            {selected === parseInt(puzzle.answer) ? '🎉 Correct! Great job!' : `Not quite — the answer was ${puzzle.emojis[parseInt(puzzle.answer)]}!`}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function GamesScreen() {
  const [bracket, setBracket] = useState<AgeBracket>('1-2y');
  const [score, setScore] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [factIdx, setFactIdx] = useState(0);

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setBracket(getAgeBracket(getAgeMonths(c.dob)) as AgeBracket);
    });
    setFactIdx(Math.floor(Math.random() * FUN_FACTS.length));
  }, []);

  const puzzles = PUZZLES_BY_BRACKET[bracket] || PUZZLES_BY_BRACKET['1-2y'];
  const currentPuzzle = puzzles[puzzleIdx % puzzles.length];

  const handleCorrect = () => {
    setScore(s => s + 1);
    setPuzzleIdx(i => i + 1);
  };

  const nextFact = () => setFactIdx(i => (i + 1) % FUN_FACTS.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>Mental Growth Games</Text>
        <View style={{ backgroundColor: '#0A0A0A', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Zap size={13} color="white" />
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>{score}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Fun fact */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Lightbulb size={16} color="#FCD34D" />
              <Text style={{ color: '#FCD34D', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Daily Fun Fact</Text>
            </View>
            <Pressable onPress={nextFact} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
          <Text style={{ color: 'white', fontSize: 15, lineHeight: 24, fontWeight: '500' }}>{FUN_FACTS[factIdx]}</Text>
        </Animated.View>

        {/* Puzzle game */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 4 }}>Puzzle Time</Text>
          <Text style={{ fontSize: 13, color: '#737373', marginBottom: 14 }}>Help your child point to the right answer!</Text>
          <PuzzleCard key={`${bracket}-${puzzleIdx}`} puzzle={currentPuzzle} onCorrect={handleCorrect} />
        </Animated.View>

        {/* Activity suggestions */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 12, marginTop: 8 }}>Activity Ideas for Today</Text>
          {[
            { emoji: '📚', title: 'Read Together', desc: 'Pick a picture book and name the objects on each page.', time: '10 min' },
            { emoji: '🎵', title: 'Sing a Nursery Rhyme', desc: 'Amar sonar bangla or Twinkle Twinkle — repetition builds language.', time: '5 min' },
            { emoji: '🖐️', title: 'Clapping Game', desc: 'Clap and copy rhythms together to develop motor coordination.', time: '5 min' },
            { emoji: '🌿', title: 'Nature Walk', desc: 'Point out colours, textures, and sounds during a short outdoor walk.', time: '20 min' },
          ].map((act, i) => (
            <Animated.View key={act.title} entering={FadeInDown.duration(400).delay(180 + i * 60)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5E5', marginBottom: 8, backgroundColor: '#FFFFFF' }}>
              <Text style={{ fontSize: 28, marginTop: 2 }}>{act.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A' }}>{act.title}</Text>
                  <View style={{ backgroundColor: '#F5F5F5', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, color: '#737373' }}>{act.time}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#374151', lineHeight: 19 }}>{act.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
