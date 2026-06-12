import { AndroidBlurScreenWrapper } from '@/app/(tabs)/_layout';
import Header from '@/components/header'
import { Text } from '@/components/ui/text';
import * as Tabs from '@rn-primitives/tabs';
import {
  Award,
  ChevronRight,
  Droplets,
  Moon,
  Syringe,
  TrendingUp,
  Activity,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FEED_DATA = [6, 7, 5, 6, 8, 6, 5];
const SLEEP_DATA = [5, 6, 7, 5, 6, 8, 5];
const MAX_VAL = 10;
const BAR_MAX_H = 56;

const MILESTONES = [
  { id: '1', label: 'Holds head up', age: '2M', achieved: true },
  { id: '2', label: 'Smiles responsively', age: '2M', achieved: true },
  { id: '3', label: 'Rolls over', age: '4M', achieved: true },
  { id: '4', label: 'Sits with support', age: '6M', achieved: true },
  { id: '5', label: 'Starts crawling', age: '9M', achieved: false },
  { id: '6', label: 'Stands with support', age: '10M', achieved: false },
];

const VACCINES = [
  { id: '1', name: 'BCG', status: 'done', date: 'Birth' },
  { id: '2', name: 'Polio OPV', status: 'done', date: '6 weeks' },
  { id: '3', name: 'Pentavalent', status: 'done', date: '6 weeks' },
  { id: '4', name: 'Measles', status: 'upcoming', date: '9 months' },
  { id: '5', name: 'MMR', status: 'upcoming', date: '12 months' },
];

function AnimatedBar({
  value,
  maxVal,
  maxH,
  delay,
  color,
}: {
  value: number;
  maxVal: number;
  maxH: number;
  delay: number;
  color: string;
}) {
  const height = useSharedValue(0);
  useEffect(() => {
    height.value = withDelay(
      delay,
      withTiming(Math.round((value / maxVal) * maxH), {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);
  const style = useAnimatedStyle(() => ({ height: height.value }));
  return (
    <Animated.View
      style={[
        style,
        { width: 18, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: color },
      ]}
    />
  );
}

export default function InsightsPage() {
  const [tab, setTab] = useState('feeds');
  const achievedCount = MILESTONES.filter((m) => m.achieved).length;
  const data = tab === 'feeds' ? FEED_DATA : SLEEP_DATA;
  const barColor = tab === 'feeds' ? 'rgba(255,255,255,0.75)' : 'rgba(196,181,253,0.85)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          className="flex-1">
          {/* ── Header ── */}
          <Header title="Insights" emoji="📈" secondaryText='Aayan&apos;s health overview'/>

          {/* ── Weekly Summary ── */}
          <Animated.View
            entering={FadeInDown.duration(480).delay(100).springify()}
            className="mx-4 mt-2">
            <View
              className="bg-brand-hero overflow-hidden rounded-3xl p-5"
              style={{
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              }}>
              <View
                style={{
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  top: -55,
                  right: -55,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              />

              {/* Tabs */}
              <Tabs.Root value={tab} onValueChange={setTab}>
                <Tabs.List
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: 4,
                    marginBottom: 18,
                  }}>
                  {[
                    { value: 'feeds', label: 'Feeds', Icon: Droplets },
                    { value: 'sleep', label: 'Sleep', Icon: Moon },
                  ].map((t) => (
                    <Tabs.Trigger
                      key={t.value}
                      value={t.value}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: tab === t.value ? 'rgba(255,255,255,0.22)' : 'transparent',
                      }}>
                      <t.Icon
                        color={tab === t.value ? 'white' : 'rgba(255,255,255,0.55)'}
                        size={13}
                      />
                      <Text
                        style={{
                          color: tab === t.value ? 'white' : 'rgba(255,255,255,0.55)',
                          fontSize: 13,
                          fontWeight: tab === t.value ? '700' : '500',
                        }}>
                        {t.label}
                      </Text>
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* Stats row */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  {[
                    {
                      label: tab === 'feeds' ? 'Avg feeds/day' : 'Avg sleep/day',
                      value: tab === 'feeds' ? '6.2' : '5.9h',
                    },
                    { label: 'Best day', value: tab === 'feeds' ? '8 feeds' : '8 hrs' },
                    { label: 'Activities', value: '4' },
                  ].map((s) => (
                    <View
                      key={s.label}
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(255,255,255,0.14)',
                        borderRadius: 16,
                        padding: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}>
                      <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>
                        {s.value}
                      </Text>
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 10,
                          textAlign: 'center',
                          marginTop: 3,
                        }}>
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Animated bar chart */}
                <Tabs.Content
                  value={tab}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: BAR_MAX_H + 24,
                  }}>
                  {WEEK_DAYS.map((day, i) => (
                    <View key={`${tab}-${i}`} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                      <AnimatedBar
                        value={data[i]}
                        maxVal={MAX_VAL}
                        maxH={BAR_MAX_H}
                        delay={i * 70}
                        color={barColor}
                      />
                      <Text
                        style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '500' }}>
                        {day}
                      </Text>
                    </View>
                  ))}
                </Tabs.Content>
              </Tabs.Root>

              <Text
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 10,
                  marginTop: 8,
                  textAlign: 'center',
                }}>
                {tab === 'feeds' ? 'Feeds per day (this week)' : 'Sleep hours per day (this week)'}
              </Text>
            </View>
          </Animated.View>

          {/* ── Milestones ── */}
          <Animated.View entering={FadeInDown.duration(440).delay(260)} className="mt-5 px-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Award color="#D97706" size={17} />
                </View>
                <Text className="text-foreground text-[17px] font-extrabold">Milestones</Text>
              </View>
              <View
                style={{
                  backgroundColor: '#F5F5F5',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}>
                <Text style={{ color: '#0A0A0A', fontSize: 12, fontWeight: '700' }}>
                  {achievedCount}/{MILESTONES.length} achieved
                </Text>
              </View>
            </View>

            <View
              className="bg-card border-border overflow-hidden rounded-2xl border"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}>
              {MILESTONES.map((m, idx) => (
                <Animated.View key={m.id} entering={FadeInDown.duration(360).delay(280 + idx * 55)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 12,
                      borderBottomWidth: idx < MILESTONES.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: m.achieved ? '#0A0A0A' : '#F3F4F6',
                        borderWidth: m.achieved ? 0 : 2,
                        borderColor: '#E5E5E5',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {m.achieved ? (
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>✓</Text>
                      ) : (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#D1D5DB',
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: '500',
                        color: m.achieved ? '#111827' : '#9CA3AF',
                      }}>
                      {m.label}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: m.achieved ? '#F5F5F5' : '#F3F4F6',
                      }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: m.achieved ? '#0A0A0A' : '#9CA3AF',
                        }}>
                        {m.age}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── Vaccination Schedule ── */}
          <Animated.View entering={FadeInDown.duration(440).delay(380)} className="mt-5 px-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: '#F5F5F5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Syringe color="#0A0A0A" size={17} />
                </View>
                <Text className="text-foreground text-[17px] font-extrabold">Vaccinations</Text>
              </View>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: '#0A0A0A', fontSize: 13, fontWeight: '600' }}>View all</Text>
                <ChevronRight color="#0A0A0A" size={14} />
              </Pressable>
            </View>

            <View
              className="bg-card border-border overflow-hidden rounded-2xl border"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}>
              {VACCINES.map((v, idx) => (
                <Animated.View key={v.id} entering={FadeInDown.duration(360).delay(400 + idx * 60)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 12,
                      borderBottomWidth: idx < VACCINES.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: v.status === 'done' ? '#0A0A0A' : '#F59E0B',
                      }}
                    />
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' }}>
                      {v.name}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: v.status === 'done' ? '#F5F5F5' : '#FFF7ED',
                      }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: v.status === 'done' ? '#0A0A0A' : '#92400E',
                        }}>
                        {v.status === 'done' ? '✓ Done' : `Due · ${v.date}`}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
    </SafeAreaView>
  );
}
