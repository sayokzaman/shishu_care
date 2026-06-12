import { Text } from '@/components/ui/text';
import * as Checkbox from '@rn-primitives/checkbox';
import { formatAge, getAgeMonths, loadChild, type ChildData } from '@/lib/child';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  Baby,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Droplets,
  FileText,
  Gamepad2,
  Lightbulb,
  MessageCircle,
  Mic,
  Moon,
  ShieldCheck,
  Sparkles,
  Syringe,
  Users,
  Utensils,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AndroidBlurScreenWrapper } from '@/app/(tabs)/_layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/header'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INITIAL_CARE = [
  { id: '1', label: 'Morning Feeding', done: true, time: '7:30 AM' },
  { id: '2', label: 'Vitamin D Drops', done: true, time: '8:00 AM' },
  { id: '3', label: 'Tummy Time', done: false, time: '10:00 AM' },
  { id: '4', label: 'Afternoon Nap', done: false, time: '2:00 PM' },
];

interface Feature {
  label: string;
  sub: string;
  Icon: any;
  color: string;
  bg: string;
  route: string;
}

const FEATURES: Feature[] = [
  {
    label: 'Care Guide',
    sub: 'Daily tips by age',
    Icon: BookOpen,
    color: '#0A0A0A',
    bg: '#F5F5F5',
    route: '/care-guide',
  },
  {
    label: 'Nutrition',
    sub: 'Age-appropriate foods',
    Icon: Utensils,
    color: '#D97706',
    bg: '#FFF7ED',
    route: '/nutrition',
  },
  {
    label: 'Milestones',
    sub: 'Milestone checklist',
    Icon: Activity,
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: '/milestones',
  },
  {
    label: 'Myth Buster',
    sub: 'Fact-check chatbot',
    Icon: MessageCircle,
    color: '#0A0A0A',
    bg: '#F5F5F5',
    route: '/chatbot',
  },
];

const MEDICALS: Feature[] = [
  {
    label: 'Vaccination',
    sub: 'Bangladesh EPI schedule',
    Icon: Syringe,
    color: '#0A0A0A',
    bg: '#F5F5F5',
    route: '/vaccination',
  },
  {
    label: 'Risk Report',
    sub: 'WHO-based screening',
    Icon: ShieldCheck,
    color: '#DC2626',
    bg: '#FEF2F2',
    route: '/risk-report',
  },
  {
    label: 'Emergency',
    sub: 'Find the right facility',
    Icon: AlertTriangle,
    color: '#DC2626',
    bg: '#FEF2F2',
    route: '/emergency',
  },
  {
    label: 'Medical Report',
    sub: 'Exportable health log',
    Icon: FileText,
    color: '#0A0A0A',
    bg: '#F5F5F5',
    route: '/medical-report',
  },
];

const EXTRAS: Feature[] = [
  {
    label: 'Games',
    sub: 'Mental growth activities',
    Icon: Gamepad2,
    color: '#2563EB',
    bg: '#EFF6FF',
    route: '/games',
  },
  {
    label: 'Learn ABC',
    sub: 'Bangla & English letters',
    Icon: BookOpen,
    color: '#D97706',
    bg: '#FFF7ED',
    route: '/learn-abc',
  },
  {
    label: 'Community',
    sub: 'Parent forum',
    Icon: Users,
    color: '#4F46E5',
    bg: '#EEF2FF',
    route: '/community',
  },
  {
    label: 'Cry Analyzer',
    sub: 'Why is baby crying?',
    Icon: Mic,
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: '/baby-cry-analyzer',
  },
  {
    label: 'Dashboard',
    sub: 'District health stats',
    Icon: ClipboardList,
    color: '#737373',
    bg: '#F5F5F5',
    route: '/dashboard',
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sleepTotalLabel(sessions: { startedAt: string; endedAt?: string | null }[]): string {
  const total = sessions.reduce((sum, s) => {
    if (!s.endedAt) return sum;
    return (
      sum + Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
    );
  }, 0);
  if (total === 0) return '—';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function PulseRing() {
  const opacity = useSharedValue(0.5);
  const scale = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 900 }), withTiming(0.5, { duration: 0 })),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={animStyle}
      className="bg-brand-hero absolute -top-1 -left-1 size-7 rounded-[14px]"
    />
  );
}

function AnimatedProgressBar({ value }: { value: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(value, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, []);
  const animStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` as any }));
  return (
    <View className="h-2.5 overflow-hidden rounded-[5px] bg-white/20">
      <Animated.View style={animStyle} className="h-full rounded-[5px] bg-white/90" />
    </View>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePress = () => {
    scale.value = withSpring(0.93, { damping: 12 }, () => {
      scale.value = withSpring(1);
    });
    setTimeout(() => router.push(feature.route as any), 80);
  };
  return (
    <Animated.View
      style={animStyle}
      className="w-[47%]"
      entering={FadeInDown.duration(400).delay(600 + index * 50)}>
      <Pressable
        onPress={handlePress}
        className="border-border mb-3 rounded-[18px] border p-4"
        style={{ backgroundColor: feature.bg }}>
        <View className="mb-2.5 size-11 items-center justify-center rounded-[14px] bg-black/[6%]">
          <feature.Icon size={22} color={feature.color} strokeWidth={1.8} />
        </View>
        <Text className="text-black mb-0.5 text-sm font-bold">{feature.label}</Text>
        <Text className="text-muted-foreground text-[11px] leading-4">{feature.sub}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [careItems, setCareItems] = useState(INITIAL_CARE);
  const [child, setChild] = useState<ChildData | null>(null);
  const [ageLabel, setAgeLabel] = useState('');

  const [lastFeedLabel, setLastFeedLabel] = useState('—');
  const [lastFeedMs, setLastFeedMs] = useState<number | null>(null);
  const [sleepLabel, setSleepLabel] = useState('—');
  const [hasSleepToday, setHasSleepToday] = useState<boolean | null>(null);
  const [activityCount, setActivityCount] = useState<number | null>(null);

  useEffect(() => {
    loadChild().then((c) => {
      if (!c) return;
      setChild(c);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
    });
  }, []);

  const loadTracking = useCallback(async () => {
    const [feedRes, sleepRes, actRes] = await Promise.allSettled([
      sendRequest('/api/feeding/sessions'),
      sendRequest('/api/sleep/sessions'),
      sendRequest('/api/activities/sessions'),
    ]);

    if (feedRes.status === 'fulfilled') {
      const sessions: { fedAt: string }[] = feedRes.value.sessions ?? [];
      if (sessions.length > 0) {
        const latest = sessions.reduce((a, b) => (new Date(a.fedAt) > new Date(b.fedAt) ? a : b));
        setLastFeedLabel(timeAgo(latest.fedAt));
        setLastFeedMs(new Date(latest.fedAt).getTime());
      } else {
        setLastFeedLabel('None today');
        setLastFeedMs(null);
      }
    }

    if (sleepRes.status === 'fulfilled') {
      const sessions = sleepRes.value.sessions ?? [];
      setSleepLabel(sleepTotalLabel(sessions));
      setHasSleepToday(sessions.length > 0);
    }

    if (actRes.status === 'fulfilled') {
      setActivityCount((actRes.value.sessions ?? []).length);
    }
  }, []);

  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  const doneCare = careItems.filter((i) => i.done).length;
  const childName = child?.name ?? 'Your Child';
  const parentGreet = 'Sarah';

  const toggleItem = (id: string) => {
    setCareItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const feedAlert = lastFeedMs === null || Date.now() - lastFeedMs > 3 * 60 * 60 * 1000;
  const sleepAlert = hasSleepToday === false;

  const greetingActivity =
    activityCount !== null
      ? `${activityCount} ${activityCount === 1 ? 'activity' : 'activities'}`
      : '…';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <AndroidBlurScreenWrapper>
        <Header title="Shishu Care" emoji="🏠">

        </Header>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          className="bg-white flex-1 text-black">
          {/* ── Greeting card ── */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(50).springify()}
            className="bg-brand-hero mx-4 mt-4 overflow-hidden rounded-3xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}>
            <View className="absolute -top-[60px] -right-[60px] size-[180px] rounded-full bg-white/[5%]" />
            <View className="absolute right-[50px] -bottom-[25px] size-[110px] rounded-full bg-white/[3%]" />

            <View className="mb-3.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Pressable onPress={() => router.push('/child-info')} className="relative">
                  <View className="size-14 items-center justify-center rounded-[18px] border-[1.5px] border-white/22 bg-white/14">
                    <Baby color="white" size={26} strokeWidth={1.5} />
                  </View>
                  {ageLabel ? (
                    <View className="absolute -right-1.5 -bottom-1 rounded-lg bg-white px-[5px] py-0.5">
                      <Text className="text-brand-hero text-[9px] font-black">
                        {ageLabel.split(' ')[0]}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
                <View>
                  <Text className="text-xs text-white/55">{childName}&apos;s Profile</Text>
                  <Text className="text-lg font-extrabold text-white">
                    Good morning, {parentGreet}!
                  </Text>
                </View>
              </View>
              <Pressable className="size-10 items-center justify-center rounded-[14px] bg-white/12">
                <Bell color="white" size={18} />
              </Pressable>
            </View>

            <View className="rounded-[14px] border border-white/12 bg-white/10 px-3.5 py-2.5">
              <Text className="text-[13px] leading-5 text-white/85">
                Today so far — <Text className="font-extrabold text-white">{greetingActivity}</Text>{' '}
                logged and{' '}
                <Text className="font-extrabold text-white">last fed {lastFeedLabel}</Text>.
              </Text>
            </View>
          </Animated.View>

          {/* ── Quick stats ── */}
          <View className="mt-3.5 flex-row gap-2.5 px-4">
            {[
              {
                label: 'Last Feed',
                value: lastFeedLabel,
                Icon: Droplets,
                color: '#2563EB',
                bg: '#EFF6FF',
                alert: feedAlert,
                message: 'Baby needs food',
              },
              {
                label: 'Sleep',
                value: sleepLabel,
                Icon: Moon,
                color: '#7C3AED',
                bg: '#F5F3FF',
                alert: sleepAlert,
                message: 'Baby needs sleep',
              },
              {
                label: 'Activities',
                value: activityCount !== null ? String(activityCount) : '—',
                Icon: Activity,
                color: '#0EA5E9',
                bg: '#F0F9FF',
                alert: false,
                message: '',
              },
            ].map((stat, i) => (
              <Animated.View
                key={stat.label}
                entering={FadeInDown.duration(400)
                  .delay(100 + i * 70)
                  .springify()}
                style={{ flex: 1, position: 'relative' }}>
                {stat.alert && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -7,
                      right: -4,
                      zIndex: 10,
                      backgroundColor: '#F97316',
                      borderRadius: 999,
                      paddingHorizontal: 4,
                      height: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}>
                    <Text
                      style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', lineHeight: 12 }}>
                      ! {stat.message}
                    </Text>
                  </View>
                )}
                <View
                  className="flex-1 items-center gap-[5px] rounded-[18px] p-3"
                  style={{ backgroundColor: stat.bg }}>
                  <View
                    className="size-[34px] items-center justify-center rounded-[11px]"
                    style={{ backgroundColor: stat.color + '22' }}>
                    <stat.Icon color={stat.color} size={16} strokeWidth={2} />
                  </View>
                  <Text className="text-black text-[15px] font-extrabold">{stat.value}</Text>
                  <Text className="text-muted-foreground text-center text-[10px] font-semibold">
                    {stat.label}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* ── AI + Risk ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(230)}
            className="mt-3.5 gap-2.5 px-4">
            <View className="bg-brand-input-bg border-border h-14 flex-row items-center gap-3 rounded-[18px] border px-4">
              <View className="relative size-5 items-center justify-center">
                <PulseRing />
                <Sparkles color="#0A0A0A" size={20} />
              </View>
              <Text className="flex-1 text-sm text-[#A3A3A3]">
                Ask NurtureAI… e.g. baby has mild fever
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/risk-report')}
              className="border-brand-risk-border bg-brand-risk-bg h-12 flex-row items-center justify-center gap-2 rounded-2xl border">
              <AlertTriangle color="#B91C1C" size={16} />
              <Text className="text-brand-risk-text text-sm font-bold">Run Risk Assessment →</Text>
            </Pressable>
          </Animated.View>

          {/* ── Milestone alert ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(290)}
            className="border-brand-milestone-border bg-brand-milestone-bg mx-4 mt-3.5 flex-row items-start gap-3 rounded-[18px] border p-3.5">
            <Pressable
              className="flex w-full flex-row items-center justify-between"
              onPress={() => router.push('/milestones')}>
              <View className="flex-row items-start gap-3">
                <View className="mt-px size-9 items-center justify-center rounded-[11px] bg-amber-200">
                  <Lightbulb color="#D97706" size={17} />
                </View>
                <View className="flex-1 text-wrap">
                  <Text className="text-brand-milestone-text mb-[3px] text-[10px] font-extrabold tracking-[1.2px]">
                    MILESTONE ALERT
                  </Text>
                  <Text className="text-brand-milestone-text text-sm leading-5 font-semibold">
                    {childName} should start crawling soon! <br />Try a floor activity today.
                  </Text>
                </View>
              </View>
              <ChevronRight color="#D97706" size={18} />
            </Pressable>
          </Animated.View>

          {/* ── Today's Care ── */}
          <Animated.View entering={FadeInDown.duration(450).delay(340)} className="mt-5 px-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-black text-[17px] font-extrabold">Today&apos;s Care</Text>
              <Pressable
                onPress={() => router.push('/care-guide')}
                className="bg-secondary rounded-full px-3 py-1.5">
                <Text className="text-foreground text-xs font-bold">
                  {doneCare}/{careItems.length} Done
                </Text>
              </Pressable>
            </View>

            <View className="bg-card border-border overflow-hidden rounded-[18px] border">
              {careItems.map((item, idx) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.duration(350).delay(370 + idx * 55)}>
                  <Pressable
                    onPress={() => toggleItem(item.id)}
                    className={`flex-row items-center gap-3.5 px-4 py-3.5 ${idx < careItems.length - 1 ? 'border-secondary border-b' : ''}`}>
                    <Checkbox.Root
                      checked={item.done}
                      onCheckedChange={() => toggleItem(item.id)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 7,
                        borderWidth: 2,
                        borderColor: item.done ? '#0A0A0A' : '#D4D4D4',
                        backgroundColor: item.done ? '#0A0A0A' : '#FAFAFA',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Checkbox.Indicator className="items-center justify-center">
                        <Check color="white" size={12} strokeWidth={3} />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <Text
                      className={`flex-1 text-sm font-medium${item.done ? 'text-[#A3A3A3] line-through' : 'text-foreground'}`}>
                      {item.label}
                    </Text>
                    <Text className="text-xs text-[#A3A3A3]">{item.time}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── Vaccination Banner ── */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(460)}
            className="bg-brand-hero mx-4 mt-4 overflow-hidden rounded-[20px] p-[18px]">
            <View className="absolute -top-[30px] -right-[30px] size-[120px] rounded-full bg-white/[5%]" />
            <View className="mb-2.5 flex-row items-start justify-between">
              <View>
                <Text className="mb-[3px] text-[10px] font-bold tracking-[1.4px] text-white/50">
                  VACCINATION TRACKER
                </Text>
                <Text className="text-base font-bold text-white">Measles Vaccine</Text>
                <Text className="mt-px text-xs text-white/60">9 Months · Due in 3 weeks</Text>
              </View>
              <Pressable
                onPress={() => router.push('/vaccination')}
                className="size-10 items-center justify-center rounded-[13px] bg-white/12">
                <Syringe color="white" size={18} />
              </Pressable>
            </View>
            <View className="mb-1.5 flex-row justify-between">
              <Text className="text-xs text-white/50">Schedule progress</Text>
              <Text className="text-xs font-bold text-white">80%</Text>
            </View>
            <AnimatedProgressBar value={80} />
          </Animated.View>

          {/* ── All Features Grid ── */}
          <Animated.View entering={FadeInDown.duration(450).delay(520)} className="mt-5 mb-1 px-4">
            <Text className="text-black mb-3.5 text-[17px] font-bold">Essentials</Text>
            <View className="flex-row flex-wrap justify-between">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={feature.route} feature={feature} index={i} />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(450).delay(520)} className="mt-5 mb-1 px-4">
            <Text className="text-black mb-3.5 text-[17px] font-bold">Medical Features</Text>
            <View className="flex-row flex-wrap justify-between">
              {MEDICALS.map((feature, i) => (
                <FeatureCard key={feature.route} feature={feature} index={i} />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(450).delay(520)} className="mt-5 mb-1 px-4">
            <Text className="text-black mb-3.5 text-[17px] font-bold">Extras</Text>
            <View className="flex-row flex-wrap justify-between">
              {EXTRAS.map((feature, i) => (
                <FeatureCard key={feature.route} feature={feature} index={i} />
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </AndroidBlurScreenWrapper>
    </SafeAreaView>
  );
}
