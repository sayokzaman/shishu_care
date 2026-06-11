import Header from '@/components/header'
import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import { Baby, Droplets, Moon, Plus, Ruler, TrendingUp } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FeedingMethod = 'breastfed' | 'bottle_breast_milk' | 'bottle_formula' | 'spoon_fed' | 'cup_fed' | 'self_fed' | 'tube_fed' | 'mixed';
type SleepType = 'nap' | 'night' | 'rest';
type ActivityType = 'tummy_time' | 'play' | 'bath' | 'outdoor' | 'reading' | 'massage' | 'music' | 'other';

interface FeedingSession {
  id: number;
  fedAt: string;
  method: FeedingMethod;
  breastSide?: string;
  durationMinutes?: number;
  amountMl?: number;
  items: { foodNameBn: string }[];
}

interface SleepSession {
  id: number;
  startedAt: string;
  endedAt?: string | null;
  type: SleepType;
  durationLabel?: string | null;
}

interface ActivitySession {
  id: number;
  startedAt: string;
  durationMinutes?: number | null;
  type: ActivityType;
}

interface GrowthMeasurement {
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number | null;
  measuredAt: string;
}

const METHOD_META: Record<FeedingMethod, { label: string; color: string; bg: string }> = {
  breastfed:          { label: 'Breastfeed',      color: '#EC4899', bg: '#FDF2F8' },
  bottle_breast_milk: { label: 'Bottle (EBM)',     color: '#0EA5E9', bg: '#F0F9FF' },
  bottle_formula:     { label: 'Bottle (Formula)', color: '#6366F1', bg: '#EEF2FF' },
  spoon_fed:          { label: 'Spoon Fed',        color: '#F59E0B', bg: '#FFFBEB' },
  cup_fed:            { label: 'Cup Fed',          color: '#10B981', bg: '#ECFDF5' },
  self_fed:           { label: 'Self Fed',         color: '#8B5CF6', bg: '#F5F3FF' },
  tube_fed:           { label: 'Tube Fed',         color: '#6B7280', bg: '#F3F4F6' },
  mixed:              { label: 'Mixed',            color: '#6B7280', bg: '#F3F4F6' },
};

const ACTIVITY_META: Record<ActivityType, { label: string; emoji: string; color: string; bg: string }> = {
  tummy_time: { label: 'Tummy Time', emoji: '🤸', color: '#F59E0B', bg: '#FFFBEB' },
  play:       { label: 'Play',       emoji: '🧸', color: '#0EA5E9', bg: '#F0F9FF' },
  bath:       { label: 'Bath',       emoji: '🛁', color: '#3B82F6', bg: '#EFF6FF' },
  outdoor:    { label: 'Outdoor',    emoji: '🌿', color: '#10B981', bg: '#ECFDF5' },
  reading:    { label: 'Reading',    emoji: '📖', color: '#6366F1', bg: '#EEF2FF' },
  massage:    { label: 'Massage',    emoji: '💆', color: '#EC4899', bg: '#FDF2F8' },
  music:      { label: 'Music',      emoji: '🎵', color: '#8B5CF6', bg: '#F5F3FF' },
  other:      { label: 'Other',      emoji: '⭐', color: '#6B7280', bg: '#F3F4F6' },
};

const SLEEP_META: Record<SleepType, { label: string; color: string; bg: string }> = {
  nap:   { label: 'Nap',   color: '#7C3AED', bg: '#F5F3FF' },
  night: { label: 'Night', color: '#4338CA', bg: '#EEF2FF' },
  rest:  { label: 'Rest',  color: '#6B7280', bg: '#F3F4F6' },
};

function sessionDetail(s: FeedingSession) {
  if (s.method === 'breastfed') {
    const side = s.breastSide ? ` · ${s.breastSide.charAt(0).toUpperCase() + s.breastSide.slice(1)}` : '';
    return s.durationMinutes ? `${s.durationMinutes} min${side}` : side.trim() || 'Breastfeed';
  }
  if (s.method === 'bottle_breast_milk' || s.method === 'bottle_formula') {
    return s.amountMl ? `${s.amountMl} ml` : 'Bottle';
  }
  return s.items.length > 0 ? s.items.map((i) => i.foodNameBn).join(', ') : METHOD_META[s.method]?.label;
}

function totalSleepLabel(sessions: SleepSession[]) {
  let total = 0;
  for (const s of sessions) {
    if (!s.endedAt) continue;
    total += Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
  }
  if (total === 0) return '0m';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

const TODAY = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

function SpringFAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[
        style,
        {
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: '#0A0A0A',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0A0A0A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 5,
        },
      ]}
      onPress={() => {
        scale.value = withSpring(0.88, { damping: 12 }, () => {
          scale.value = withSpring(1, { damping: 10 });
        });
        onPress();
      }}>
      <Plus color="white" size={18} />
    </AnimatedPressable>
  );
}

export default function TrackPage() {
  const [feedSessions, setFeedSessions] = useState<FeedingSession[]>([]);
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [activitySessions, setActivitySessions] = useState<ActivitySession[]>([]);
  const [growth, setGrowth] = useState<GrowthMeasurement | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [feedRes, sleepRes, actRes, growthRes] = await Promise.allSettled([
        sendRequest('/api/feeding/sessions'),
        sendRequest('/api/sleep/sessions'),
        sendRequest('/api/activities/sessions'),
        sendRequest('/api/growth/latest'),
      ]);
      if (feedRes.status === 'fulfilled') setFeedSessions(feedRes.value.sessions ?? []);
      if (sleepRes.status === 'fulfilled') setSleepSessions(sleepRes.value.sessions ?? []);
      if (actRes.status === 'fulfilled') setActivitySessions(actRes.value.sessions ?? []);
      if (growthRes.status === 'fulfilled') setGrowth(growthRes.value.measurement ?? null);
    } catch {
      // non-fatal — keep empty state
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}>
        {/* ── Header ── */}
        <Header title='Daily Tracking' secondaryText={TODAY} emoji='👶' />

        {/* ── Summary strip ── */}
        <View className="mt-2 flex-row gap-3 px-4">
          {[
            {
              label: 'Feeds',
              value: String(feedSessions.length),
              Icon: Droplets,
              color: '#3B82F6',
              bg: '#EFF6FF',
              delay: 100,
            },
            {
              label: 'Sleep',
              value: totalSleepLabel(sleepSessions),
              Icon: Moon,
              color: '#7C3AED',
              bg: '#F5F3FF',
              delay: 170,
            },
            {
              label: 'Activities',
              value: String(activitySessions.length),
              Icon: TrendingUp,
              color: '#0A0A0A',
              bg: '#F5F5F5',
              delay: 240,
            },
          ].map((stat) => {
            const StatIcon = stat.Icon;
            return (
              <Animated.View
                key={stat.label}
                entering={FadeInDown.duration(400).delay(stat.delay).springify()}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  padding: 14,
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: stat.bg,
                }}>
                <StatIcon color={stat.color} size={20} />
                <Text style={{ color: stat.color, fontSize: 19, fontWeight: '800' }}>
                  {stat.value}
                </Text>
                <Text style={{ color: stat.color, fontSize: 11, fontWeight: '600', opacity: 0.75 }}>
                  {stat.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Feeding Log ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(290)} className="mt-5 px-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Droplets color="#3B82F6" size={17} />
              </View>
              <Text className="text-foreground text-[17px] font-extrabold">Feeding</Text>
            </View>
            <SpringFAB onPress={() => router.push('/feeding-log')} />
          </View>

          <View
            className="bg-card border-border overflow-hidden rounded-2xl border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}>
            {feedSessions.slice(0, 4).map((feed, idx) => {
              const meta = METHOD_META[feed.method] ?? METHOD_META.mixed;
              return (
                <Animated.View
                  key={feed.id}
                  entering={FadeInRight.duration(350).delay(310 + idx * 60)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 12,
                      borderBottomWidth: idx < Math.min(feedSessions.length, 4) - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: meta.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Droplets color={meta.color} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                        {meta.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                        {sessionDetail(feed)}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: meta.bg,
                      }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: meta.color }}>
                        {new Date(feed.fedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
            <Pressable
              onPress={() => router.push('/feeding-log')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 12,
                borderTopWidth: feedSessions.length > 0 ? 1 : 0,
                borderTopColor: '#E5E5E5',
              }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#E5E5E5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
                {feedSessions.length > 4 ? `View all ${feedSessions.length} feedings` : 'Log a feeding'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Sleep Log ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(400)} className="mt-5 px-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: '#F5F3FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Moon color="#7C3AED" size={17} />
              </View>
              <Text className="text-foreground text-[17px] font-extrabold">Sleep</Text>
            </View>
            <SpringFAB onPress={() => router.push('/sleep-log')} />
          </View>

          <View
            className="bg-card border-border overflow-hidden rounded-2xl border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}>
            {sleepSessions.slice(0, 4).map((sleep, idx) => {
              const meta = SLEEP_META[sleep.type] ?? SLEEP_META.nap;
              return (
                <Animated.View
                  key={sleep.id}
                  entering={FadeInLeft.duration(350).delay(420 + idx * 70)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 12,
                      borderBottomWidth: idx < Math.min(sleepSessions.length, 4) - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: meta.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Moon color={meta.color} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                        {meta.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {new Date(sleep.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {sleep.endedAt
                          ? ` – ${new Date(sleep.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : ' · ongoing'}
                      </Text>
                    </View>
                    {sleep.durationLabel && (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                          backgroundColor: meta.bg,
                        }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: meta.color }}>
                          {sleep.durationLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
            <Pressable
              onPress={() => router.push('/sleep-log')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 12,
                borderTopWidth: sleepSessions.length > 0 ? 1 : 0,
                borderTopColor: '#E5E5E5',
              }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#E5E5E5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
                {sleepSessions.length > 4 ? `View all ${sleepSessions.length} sleep sessions` : 'Log sleep'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Activity Log ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(450)} className="mt-5 px-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: '#F0F9FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TrendingUp color="#0EA5E9" size={17} />
              </View>
              <Text className="text-foreground text-[17px] font-extrabold">Activities</Text>
            </View>
            <SpringFAB onPress={() => router.push('/activity-log')} />
          </View>

          <View
            className="bg-card border-border overflow-hidden rounded-2xl border"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}>
            {activitySessions.slice(0, 4).map((act, idx) => {
              const meta = ACTIVITY_META[act.type] ?? ACTIVITY_META.other;
              return (
                <Animated.View
                  key={act.id}
                  entering={FadeInRight.duration(350).delay(470 + idx * 60)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 12,
                      borderBottomWidth: idx < Math.min(activitySessions.length, 4) - 1 ? 1 : 0,
                      borderBottomColor: '#E5E5E5',
                    }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: meta.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                        {meta.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {new Date(act.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    {act.durationMinutes ? (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                          backgroundColor: meta.bg,
                        }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: meta.color }}>
                          {act.durationMinutes}m
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Animated.View>
              );
            })}
            <Pressable
              onPress={() => router.push('/activity-log')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 12,
                borderTopWidth: activitySessions.length > 0 ? 1 : 0,
                borderTopColor: '#E5E5E5',
              }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#E5E5E5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
                {activitySessions.length > 4 ? `View all ${activitySessions.length} activities` : 'Log activity'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Growth Snapshot ── */}
        <Animated.View entering={FadeInDown.duration(420).delay(490)} className="mt-5 px-4">
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
                <Ruler color="#0A0A0A" size={17} />
              </View>
              <View>
                <Text className="text-foreground text-[17px] font-extrabold">Growth Snapshot</Text>
                {growth && (
                  <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 1 }}>
                    Last: {new Date(growth.measuredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                )}
              </View>
            </View>
            <SpringFAB onPress={() => router.push('/growth-log')} />
          </View>

          <View className="flex-row gap-3">
            {[
              {
                label: 'Weight',
                value: growth && growth.weightKg > 0 ? `${growth.weightKg} kg` : '—',
                Icon: Baby,
                color: '#0A0A0A',
                bg: '#F5F5F5',
              },
              {
                label: 'Height',
                value: growth && growth.heightCm > 0 ? `${growth.heightCm} cm` : '—',
                Icon: Ruler,
                color: '#3B82F6',
                bg: '#EFF6FF',
              },
              {
                label: 'Head Circ.',
                value: growth?.headCircumferenceCm ? `${growth.headCircumferenceCm} cm` : '—',
                Icon: TrendingUp,
                color: '#7C3AED',
                bg: '#F5F3FF',
              },
            ].map((m, i) => {
              const MIcon = m.Icon;
              return (
                <Animated.View
                  key={m.label}
                  entering={FadeInDown.duration(380).delay(510 + i * 60)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 14,
                    alignItems: 'center',
                    gap: 6,
                    borderWidth: 1,
                    borderColor: '#E5E5E5',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 1,
                  }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: m.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MIcon color={m.color} size={16} />
                  </View>
                  <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>
                    {m.value}
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '500' }}>
                    {m.label}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={FadeInDown.duration(380).delay(600)}>
            <Pressable
              onPress={() => router.push('/growth-log')}
              style={{
                marginTop: 12,
                height: 46,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                borderWidth: 1,
                borderColor: '#E5E5E5',
                backgroundColor: '#FFFFFF',
              }}>
              <Baby color="#0A0A0A" size={16} />
              <Text style={{ color: '#111827', fontSize: 14, fontWeight: '600' }}>
                {growth ? 'View all measurements' : 'Add first measurement'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
