import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

const FACES = ['🐻', '🐼', '🦊', '🐸', '🐨', '🐯', '🦁', '🐮'];

export default function PeekabooGame() {
  const [hidden, setHidden] = useState(true);
  const [face] = useState(FACES[Math.floor(Math.random() * FACES.length)]);
  const [taps, setTaps] = useState(0);
  const [currentFace, setCurrentFace] = useState(face);
  const scale = useSharedValue(0.5);
  const bgOpacity = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: bgOpacity.value }));

  const reveal = () => {
    if (!hidden) return hide();
    setHidden(false);
    scale.value = withSequence(withSpring(1.15), withSpring(1));
  };

  const hide = () => {
    scale.value = withTiming(0.5, { duration: 200 }, () => { scale.value = withSpring(1); });
    setHidden(true);
    setTaps(t => t + 1);
    setTimeout(() => {
      setCurrentFace(FACES[Math.floor(Math.random() * FACES.length)]);
    }, 300);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7ED' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#92400E" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#92400E' }}>Peek-a-Boo!</Text>
          <Text style={{ fontSize: 12, color: '#B45309' }}>লুকোচুরি · Ages 0–12m</Text>
        </View>
        <View style={{ backgroundColor: '#F97316', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '800' }}>{taps} taps</Text>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
        {/* Hands covering */}
        {hidden && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ position: 'absolute', zIndex: 10, flexDirection: 'row', gap: -40 }}>
            <Text style={{ fontSize: 100, transform: [{ scaleX: -1 }] }}>🙌</Text>
            <Text style={{ fontSize: 100 }}>🙌</Text>
          </Animated.View>
        )}

        {/* Animal face */}
        <Animated.View style={anim}>
          <Text style={{ fontSize: 140 }}>{currentFace}</Text>
        </Animated.View>

        {/* Big tap area */}
        <Pressable onPress={reveal} style={{ marginTop: 40, backgroundColor: '#F97316', borderRadius: 28, paddingVertical: 20, paddingHorizontal: 48 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white' }}>
            {hidden ? '👁️ Peek!' : '🙈 Hide!'}
          </Text>
        </Pressable>

        <Text style={{ marginTop: 24, fontSize: 15, color: '#92400E', textAlign: 'center', fontWeight: '600' }}>
          {hidden ? 'কে লুকিয়ে আছে? Who is hiding?' : `এই দেখো! It's ${currentFace}!`}
        </Text>

        {taps >= 5 && (
          <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: 20, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#FED7AA' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E', textAlign: 'center' }}>
              🎉 {taps} rounds! দারুণ খেলেছ!
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
