import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

type Lang = 'en' | 'bn';

interface LetterData { letter: string; word: string; emoji: string; pronunciation: string; bnLetter?: string; bnWord?: string; }

const ENGLISH: LetterData[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎', pronunciation: 'AY' },
  { letter: 'B', word: 'Baby', emoji: '👶', pronunciation: 'BEE' },
  { letter: 'C', word: 'Cat', emoji: '🐱', pronunciation: 'SEE' },
  { letter: 'D', word: 'Duck', emoji: '🦆', pronunciation: 'DEE' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', pronunciation: 'EE' },
  { letter: 'F', word: 'Fish', emoji: '🐟', pronunciation: 'EFF' },
  { letter: 'G', word: 'Goat', emoji: '🐐', pronunciation: 'JEE' },
  { letter: 'H', word: 'House', emoji: '🏠', pronunciation: 'AITCH' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦', pronunciation: 'EYE' },
  { letter: 'J', word: 'Jackfruit', emoji: '🍈', pronunciation: 'JAY' },
  { letter: 'K', word: 'Kite', emoji: '🪁', pronunciation: 'KAY' },
  { letter: 'L', word: 'Lemon', emoji: '🍋', pronunciation: 'ELL' },
  { letter: 'M', word: 'Mango', emoji: '🥭', pronunciation: 'EM' },
  { letter: 'N', word: 'Nest', emoji: '🪹', pronunciation: 'EN' },
  { letter: 'O', word: 'Orange', emoji: '🍊', pronunciation: 'OH' },
  { letter: 'P', word: 'Parrot', emoji: '🦜', pronunciation: 'PEE' },
  { letter: 'Q', word: 'Queen', emoji: '👑', pronunciation: 'KYOO' },
  { letter: 'R', word: 'Rain', emoji: '🌧️', pronunciation: 'AR' },
  { letter: 'S', word: 'Sun', emoji: '☀️', pronunciation: 'ESS' },
  { letter: 'T', word: 'Tiger', emoji: '🐯', pronunciation: 'TEE' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', pronunciation: 'YOO' },
  { letter: 'V', word: 'Van', emoji: '🚐', pronunciation: 'VEE' },
  { letter: 'W', word: 'Water', emoji: '💧', pronunciation: 'DOUBLE-U' },
  { letter: 'X', word: 'X-ray', emoji: '🩻', pronunciation: 'EKS' },
  { letter: 'Y', word: 'Yogurt', emoji: '🥛', pronunciation: 'WYE' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', pronunciation: 'ZED' },
];

const BANGLA: LetterData[] = [
  { letter: 'অ', bnLetter: 'অ', word: 'Aam', bnWord: 'আম', emoji: '🥭', pronunciation: 'O' },
  { letter: 'আ', bnLetter: 'আ', word: 'Amar', bnWord: 'আমার', emoji: '❤️', pronunciation: 'AA' },
  { letter: 'ক', bnLetter: 'ক', word: 'Kola', bnWord: 'কলা', emoji: '🍌', pronunciation: 'KO' },
  { letter: 'খ', bnLetter: 'খ', word: 'Khoka', bnWord: 'খোকা', emoji: '👦', pronunciation: 'KHO' },
  { letter: 'গ', bnLetter: 'গ', word: 'Goru', bnWord: 'গরু', emoji: '🐄', pronunciation: 'GO' },
  { letter: 'ঘ', bnLetter: 'ঘ', word: 'Ghuri', bnWord: 'ঘুড়ি', emoji: '🪁', pronunciation: 'GHO' },
  { letter: 'চ', bnLetter: 'চ', word: 'Chil', bnWord: 'চিল', emoji: '🦅', pronunciation: 'CHO' },
  { letter: 'ছ', bnLetter: 'ছ', word: 'Chata', bnWord: 'ছাতা', emoji: '☂️', pronunciation: 'CHHO' },
  { letter: 'জ', bnLetter: 'জ', word: 'Jol', bnWord: 'জল', emoji: '💧', pronunciation: 'JO' },
  { letter: 'ত', bnLetter: 'ত', word: 'Tara', bnWord: 'তারা', emoji: '⭐', pronunciation: 'TO' },
  { letter: 'দ', bnLetter: 'দ', word: 'Doodh', bnWord: 'দুধ', emoji: '🥛', pronunciation: 'DO' },
  { letter: 'ন', bnLetter: 'ন', word: 'Nadi', bnWord: 'নদী', emoji: '🌊', pronunciation: 'NO' },
  { letter: 'ব', bnLetter: 'ব', word: 'Bagh', bnWord: 'বাঘ', emoji: '🐯', pronunciation: 'BO' },
  { letter: 'ম', bnLetter: 'ম', word: 'Ma', bnWord: 'মা', emoji: '🤱', pronunciation: 'MO' },
  { letter: 'স', bnLetter: 'স', word: 'Surjo', bnWord: 'সূর্য', emoji: '☀️', pronunciation: 'SHO' },
];

const BG_COLORS = ['#EFF6FF','#FFF7ED','#F0FDF4','#FFF1F2','#F5F3FF','#ECFDF5','#FFFBEB'];

function LetterCard({ item, index, active, onPress }: { item: LetterData; index: number; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = BG_COLORS[index % BG_COLORS.length];

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.92), withSpring(1));
    onPress();
  };

  return (
    <Animated.View style={[style, { width: '47%' }]} entering={FadeInDown.duration(300).delay(index * 30)}>
      <Pressable onPress={handlePress} style={{ backgroundColor: active ? '#0A0A0A' : bg, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: active ? 0 : 1, borderColor: '#E5E5E5', marginBottom: 10 }}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
        <Text style={{ fontSize: 32, fontWeight: '900', color: active ? 'white' : '#0A0A0A', marginTop: 4 }}>{item.letter}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: active ? 'rgba(255,255,255,0.8)' : '#374151', marginTop: 2 }}>{item.bnWord || item.word}</Text>
        <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 }}>
          <Text style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.7)' : '#737373', fontWeight: '600' }}>{item.pronunciation}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LearnAbcScreen() {
  const [lang, setLang] = useState<Lang>('en');
  const [active, setActive] = useState<string | null>(null);
  const letters = lang === 'en' ? ENGLISH : BANGLA;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>Learn A-B-C</Text>
        {/* Language switcher */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 3 }}>
          {(['en', 'bn'] as const).map(l => (
            <Pressable key={l} onPress={() => setLang(l)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9, backgroundColor: lang === l ? '#0A0A0A' : 'transparent' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: lang === l ? 'white' : '#737373' }}>{l === 'en' ? 'English' : 'বাংলা'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        <Animated.View entering={FadeInDown.duration(400).delay(40)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Volume2 size={24} color="#FCD34D" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 15, fontWeight: '800', marginBottom: 3 }}>Tap any letter to explore!</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Read the letter name, say the word, point to the picture.</Text>
          </View>
        </Animated.View>

        {/* Active letter detail */}
        {active && (() => {
          const found = letters.find(l => l.letter === active);
          if (!found) return null;
          return (
            <Animated.View entering={FadeInDown.duration(300)} style={{ backgroundColor: '#F5F5F5', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: '#0A0A0A' }}>
              <Text style={{ fontSize: 72, marginBottom: 4 }}>{found.emoji}</Text>
              <Text style={{ fontSize: 52, fontWeight: '900', color: '#0A0A0A' }}>{found.letter}</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 4 }}>{found.bnWord || found.word}</Text>
              {found.bnWord && <Text style={{ fontSize: 14, color: '#737373', marginTop: 4 }}>{found.word}</Text>}
              <Text style={{ fontSize: 13, color: '#737373', marginTop: 8 }}>Say it: "<Text style={{ fontWeight: '700', color: '#0A0A0A' }}>{found.pronunciation}</Text>"</Text>
            </Animated.View>
          );
        })()}

        {/* Letter grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {letters.map((item, i) => (
            <LetterCard
              key={item.letter}
              item={item}
              index={i}
              active={active === item.letter}
              onPress={() => setActive(prev => prev === item.letter ? null : item.letter)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
