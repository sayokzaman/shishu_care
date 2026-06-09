import { Text } from '@/components/ui/text';
import { Baby, Droplets, Moon, Plus, Ruler, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TODAY = 'Monday, June 9';

const FEED_LOG = [
  { id: '1', type: 'Breastfeed', detail: '15 min · Left', time: '7:30 AM', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '2', type: 'Breastfeed', detail: '12 min · Right', time: '10:45 AM', color: '#3B82F6', bg: '#EFF6FF' },
  { id: '3', type: 'Bottle Feed', detail: '120 ml', time: '1:30 PM', color: '#0EA5E9', bg: '#F0F9FF' },
];

const SLEEP_LOG = [
  { id: '1', label: 'Morning nap', start: '9:15 AM', end: '10:30 AM', duration: '1h 15m' },
  { id: '2', label: 'Afternoon nap', start: '2:00 PM', end: '4:00 PM', duration: '2h 00m' },
];

const GROWTH = { weight: '8.2 kg', height: '68 cm', head: '43 cm', date: 'Jun 1' };

function SpringFAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[style, {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0A0A0A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
      }]}
      onPress={() => {
        scale.value = withSpring(0.88, { damping: 12 }, () => { scale.value = withSpring(1, { damping: 10 }); });
        onPress();
      }}>
      <Plus color="white" size={18} />
    </AnimatedPressable>
  );
}

export default function TrackPage() {
  return (
    <View className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} className="px-4 pt-4 pb-2">
          <Text className="text-foreground text-[26px] font-extrabold">Daily Tracking</Text>
          <Text className="text-muted-foreground text-[13px] mt-0.5">{TODAY}</Text>
        </Animated.View>

        {/* ── Summary strip ── */}
        <View className="flex-row gap-3 px-4 mt-2">
          {[
            { label: 'Feeds', value: '3', Icon: Droplets, color: '#3B82F6', bg: '#EFF6FF', delay: 100 },
            { label: 'Sleep', value: '3h 15m', Icon: Moon, color: '#7C3AED', bg: '#F5F3FF', delay: 170 },
            { label: 'Activities', value: '4', Icon: TrendingUp, color: '#0A0A0A', bg: '#F5F5F5', delay: 240 },
          ].map(stat => {
            const StatIcon = stat.Icon;
            return (
              <Animated.View
                key={stat.label}
                entering={FadeInDown.duration(400).delay(stat.delay).springify()}
                style={{ flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6, backgroundColor: stat.bg }}>
                <StatIcon color={stat.color} size={20} />
                <Text style={{ color: stat.color, fontSize: 19, fontWeight: '800' }}>{stat.value}</Text>
                <Text style={{ color: stat.color, fontSize: 11, fontWeight: '600', opacity: 0.75 }}>{stat.label}</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Feeding Log ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(290)} className="px-4 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2.5">
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets color="#3B82F6" size={17} />
              </View>
              <Text className="text-foreground text-[17px] font-extrabold">Feeding</Text>
            </View>
            <SpringFAB onPress={() => {}} />
          </View>

          <View
            className="bg-card rounded-2xl overflow-hidden border border-border"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}>
            {FEED_LOG.map((feed, idx) => (
              <Animated.View key={feed.id} entering={FadeInRight.duration(350).delay(310 + idx * 60)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: idx < FEED_LOG.length - 1 ? 1 : 0, borderBottomColor: '#E5E5E5' }}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: feed.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Droplets color={feed.color} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{feed.type}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{feed.detail}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: feed.bg }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: feed.color }}>{feed.time}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Log a feeding</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Sleep Log ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(400)} className="px-4 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2.5">
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' }}>
                <Moon color="#7C3AED" size={17} />
              </View>
              <Text className="text-foreground text-[17px] font-extrabold">Sleep</Text>
            </View>
            <SpringFAB onPress={() => {}} />
          </View>

          <View
            className="bg-card rounded-2xl overflow-hidden border border-border"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}>
            {SLEEP_LOG.map((sleep, idx) => (
              <Animated.View key={sleep.id} entering={FadeInLeft.duration(350).delay(420 + idx * 70)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: idx < SLEEP_LOG.length - 1 ? 1 : 0, borderBottomColor: '#E5E5E5' }}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' }}>
                    <Moon color="#7C3AED" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{sleep.label}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{sleep.start} – {sleep.end}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F5F3FF' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#7C3AED' }}>{sleep.duration}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Log sleep</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Growth Snapshot ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(490)} className="px-4 mt-5">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
              <Ruler color="#0A0A0A" size={17} />
            </View>
            <Text className="text-foreground text-[17px] font-extrabold">Growth Snapshot</Text>
            <View style={{ marginLeft: 'auto', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '600' }}>As of {GROWTH.date}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            {[
              { label: 'Weight', value: GROWTH.weight, Icon: Baby, color: '#0A0A0A', bg: '#F5F5F5' },
              { label: 'Height', value: GROWTH.height, Icon: Ruler, color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Head Circ.', value: GROWTH.head, Icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF' },
            ].map((m, i) => {
              const MIcon = m.Icon;
              return (
                <Animated.View
                  key={m.label}
                  entering={FadeInDown.duration(380).delay(510 + i * 60)}
                  style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E5E5', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: m.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <MIcon color={m.color} size={16} />
                  </View>
                  <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>{m.value}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '500' }}>{m.label}</Text>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={FadeInDown.duration(380).delay(600)}>
            <Pressable style={{ marginTop: 12, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
              <Baby color="#0A0A0A" size={16} />
              <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>Update measurements</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
