import { Text } from '@/components/ui/text';
import { getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Lightbulb, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

const FUN_FACTS: string[] = [
  'Babies can recognise their mother\'s voice from inside the womb.',
  'A newborn\'s brain doubles in size in the first year.',
  'Singing to your baby helps develop language faster.',
  'Babies are born with 300 bones; adults have 206.',
  'Tummy time helps prevent flat head and builds neck strength.',
  'Reading aloud to infants wires the brain for language.',
  'Babies understand "no" by about 9 months.',
  'Play is the most important work of early childhood.',
  '"আয় আয় চাঁদ মামা" is one of Bangladesh\'s most beloved nursery rhymes.',
  'A 2-year-old learns about 10 new words every day.',
  'Children learn languages more easily before age 7.',
  'Dancing with your toddler improves balance and coordination.',
  '"আমার সোনার বাংলা" — knowing our national anthem builds cultural identity.',
];

const ACTIVITY_IDEAS = [
  { emoji: '📚', title: 'Read Together',       desc: 'Pick a picture book and name the objects on each page.',            time: '10 min' },
  { emoji: '🎵', title: 'Sing a Nursery Rhyme', desc: '"আয় আয় চাঁদ মামা" — repetition builds language.',                 time: '5 min'  },
  { emoji: '🖐️', title: 'Clapping Game',        desc: 'Clap and copy rhythms together to develop motor coordination.',     time: '5 min'  },
  { emoji: '🌿', title: 'Nature Walk',           desc: 'Point out colours, textures, and sounds during a short walk.',      time: '20 min' },
];

type GameCard = {
  id: string; emoji: string; title: string; titleBn: string;
  desc: string; color: string; textColor: string; route: string; age: string;
};

const GAMES: GameCard[] = [
  // Row 1 — Core
  { id: 'peekaboo',  emoji: '👀', title: 'Peek-a-Boo',       titleBn: 'লুকোচুরি',        desc: 'Tap to reveal!',                    color: '#FFF7ED', textColor: '#92400E', route: '/game-peekaboo',      age: '0–12m' },
  { id: 'count',     emoji: '🔢', title: 'Count It!',         titleBn: 'গণনা করো',         desc: 'Count & pick the number',           color: '#FFFBEB', textColor: '#92400E', route: '/game-count',          age: '1–5y'  },
  { id: 'colors',    emoji: '🎨', title: 'Colour Quiz',       titleBn: 'রঙ চেনো',           desc: 'Name that colour!',                 color: '#FFF1F2', textColor: '#9F1239', route: '/game-colors',         age: '1–5y'  },
  { id: 'sounds',    emoji: '🐄', title: 'Animal Sounds',     titleBn: 'প্রাণীর ডাক',       desc: 'Which animal says that?',           color: '#F0FDF4', textColor: '#166534', route: '/game-sounds',         age: '1–5y'  },
  { id: 'body',      emoji: '👁️', title: 'Body Parts',        titleBn: 'শরীরের অঙ্গ',       desc: 'Point to the right part',           color: '#EFF6FF', textColor: '#1E40AF', route: '/game-body-parts',     age: '1–3y'  },
  { id: 'shapes',    emoji: '🔺', title: 'Shape Match',       titleBn: 'আকৃতি মেলাও',       desc: 'Find the matching shape',           color: '#EFF6FF', textColor: '#1E40AF', route: '/game-shapes',         age: '2–5y'  },
  // Row 2 — Toddler
  { id: 'missing',   emoji: '❓', title: "What's Missing?",   titleBn: 'কী নেই?',            desc: 'Spot the hidden emoji',             color: '#F5F3FF', textColor: '#6B21A8', route: '/game-missing',        age: '1.5–4y'},
  { id: 'emotions',  emoji: '😊', title: 'Emotions',          titleBn: 'অনুভূতি',            desc: 'Name that feeling',                 color: '#FFF7ED', textColor: '#92400E', route: '/game-emotions',       age: '2–5y'  },
  { id: 'weather',   emoji: '⛅', title: 'Weather Quiz',      titleBn: 'আবহাওয়া',           desc: 'Match the weather clue',            color: '#EFF6FF', textColor: '#1E40AF', route: '/game-weather',        age: '2–5y'  },
  { id: 'odd',       emoji: '🤔', title: 'Odd One Out',       titleBn: 'বেমানান কোনটি?',     desc: 'Find the one that doesn\'t fit',    color: '#ECFDF5', textColor: '#065F46', route: '/game-odd-one-out',    age: '2–5y'  },
  { id: 'sort',      emoji: '🗂️', title: 'Sort It!',          titleBn: 'বাছাই করো',          desc: 'Pick the right category',           color: '#FFF1F2', textColor: '#9F1239', route: '/game-sort',           age: '2–4y'  },
  { id: 'vehicles',  emoji: '🚗', title: 'Vehicles Sort',     titleBn: 'যানবাহন',            desc: 'Land, air or water?',               color: '#ECFDF5', textColor: '#065F46', route: '/game-vehicles',       age: '2–4y'  },
  // Row 3 — Pre-school
  { id: 'opposites', emoji: '↔️', title: 'Opposites',         titleBn: 'বিপরীত শব্দ',        desc: 'Big/Small, Hot/Cold...',            color: '#F5F3FF', textColor: '#6B21A8', route: '/game-opposites',      age: '2–5y'  },
  { id: 'patterns',  emoji: '🔁', title: 'Pattern Complete',  titleBn: 'ধারা সম্পূর্ণ',      desc: 'What comes next?',                  color: '#FFFBEB', textColor: '#92400E', route: '/game-patterns',       age: '2–5y'  },
  { id: 'healthy',   emoji: '🥦', title: 'Healthy Food',      titleBn: 'স্বাস্থ্যকর খাবার',  desc: 'Healthy or unhealthy?',             color: '#F0FDF4', textColor: '#166534', route: '/game-healthy',        age: '2–5y'  },
  { id: 'wordstart', emoji: '🔤', title: 'Word Starter',      titleBn: 'কোন অক্ষর?',         desc: 'Match word to letter',              color: '#FFF1F2', textColor: '#9F1239', route: '/game-word-start',     age: '3–5y'  },
  { id: 'seasons',   emoji: '🌸', title: 'BD Seasons',        titleBn: 'বাংলার ষড়ঋতু',       desc: 'Bangladesh\'s 6 seasons',           color: '#EFF6FF', textColor: '#1E40AF', route: '/game-seasons',        age: '3–5y'  },
  { id: 'numorder',  emoji: '🔢', title: 'Number Order',      titleBn: 'সংখ্যার ক্রম',        desc: 'Tap numbers 1 → N in order',        color: '#F5F3FF', textColor: '#6B21A8', route: '/game-number-order',   age: '3–5y'  },
  { id: 'addition',  emoji: '➕', title: 'Simple Sums',       titleBn: 'যোগ করো',             desc: 'Count emoji groups to add',          color: '#ECFDF5', textColor: '#065F46', route: '/game-addition',       age: '4–5y'  },
  { id: 'abc',       emoji: '🔡', title: 'Learn A-B-C',       titleBn: 'অ-আ-ক-খ',            desc: 'Letters in English & Bangla',       color: '#FFFBEB', textColor: '#92400E', route: '/learn-abc',           age: '2–5y'  },
];

function GameCardItem({ game, index }: { game: GameCard; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePress = () => {
    scale.value = withSequence(withSpring(0.94), withSpring(1));
    setTimeout(() => router.push(game.route as any), 120);
  };
  return (
    <Animated.View entering={FadeInDown.duration(350).delay(40 + index * 40)} style={[animStyle, { width: '48%' }]}>
      <Pressable onPress={handlePress}
        style={{ backgroundColor: game.color, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ fontSize: 32 }}>{game.emoji}</Text>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: game.textColor }}>{game.age}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#0A0A0A', marginBottom: 2 }}>{game.title}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: game.textColor, marginBottom: 4 }}>{game.titleBn}</Text>
        <Text style={{ fontSize: 11, color: '#737373', lineHeight: 16 }}>{game.desc}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GamesScreen() {
  const [bracket, setBracket] = useState('1-2y');
  const [factIdx, setFactIdx] = useState(0);

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setBracket(getAgeBracket(getAgeMonths(c.dob)));
    });
    setFactIdx(Math.floor(Math.random() * FUN_FACTS.length));
  }, []);

  const nextFact = () => setFactIdx(i => (i + 1) % FUN_FACTS.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0A0A0A' }}>Learning Games</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>শেখার খেলা · {GAMES.length} games</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        {/* Fun fact */}
        <Animated.View entering={FadeInDown.duration(400).delay(40)}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 24 }}>
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

        {/* Game grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 4 }}>All {GAMES.length} Games</Text>
          <Text style={{ fontSize: 13, color: '#737373', marginBottom: 14 }}>Age shown on each card · বয়স অনুযায়ী খেলো!</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {GAMES.map((game, i) => <GameCardItem key={game.id} game={game} index={i} />)}
          </View>
        </Animated.View>

        {/* Activity suggestions */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0A0A0A', marginBottom: 12, marginTop: 8 }}>Activity Ideas for Today</Text>
          {ACTIVITY_IDEAS.map((act, i) => (
            <Animated.View key={act.title} entering={FadeInDown.duration(400).delay(180 + i * 60)}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5E5', marginBottom: 8 }}>
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
