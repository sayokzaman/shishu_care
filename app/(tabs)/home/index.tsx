import { Text } from '@/components/ui/text';
import * as Checkbox from '@rn-primitives/checkbox';
import { formatAge, getAgeMonths, loadChild, type ChildData } from '@/lib/child';
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
  Moon,
  ShieldCheck,
  Sparkles,
  Syringe,
  Users,
  Utensils,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INITIAL_CARE = [
  { id: '1', label: 'Morning Feeding', done: true,  time: '7:30 AM' },
  { id: '2', label: 'Vitamin D Drops',  done: true,  time: '8:00 AM' },
  { id: '3', label: 'Tummy Time',       done: false, time: '10:00 AM' },
  { id: '4', label: 'Afternoon Nap',    done: false, time: '2:00 PM' },
];

interface Feature { label: string; sub: string; Icon: any; color: string; bg: string; route: string; }

const FEATURES: Feature[] = [
  { label: 'Care Guide',       sub: 'Daily tips by age',       Icon: BookOpen,      color: '#0A0A0A', bg: '#F5F5F5',   route: '/care-guide' },
  { label: 'Risk Report',      sub: 'WHO-based screening',     Icon: ShieldCheck,   color: '#DC2626', bg: '#FEF2F2',   route: '/risk-report' },
  { label: 'Nutrition',        sub: 'Age-appropriate foods',   Icon: Utensils,      color: '#D97706', bg: '#FFF7ED',   route: '/nutrition' },
  { label: 'Growth Check',     sub: 'Milestone checklist',     Icon: Activity,      color: '#7C3AED', bg: '#F5F3FF',   route: '/growth-check' },
  { label: 'Vaccination',      sub: 'Bangladesh EPI schedule', Icon: Syringe,       color: '#0A0A0A', bg: '#F5F5F5',   route: '/vaccination' },
  { label: 'Medical Report',   sub: 'Exportable health log',   Icon: FileText,      color: '#0A0A0A', bg: '#F5F5F5',   route: '/medical-report' },
  { label: 'Games',            sub: 'Mental growth activities',Icon: Gamepad2,      color: '#2563EB', bg: '#EFF6FF',   route: '/games' },
  { label: 'Learn ABC',        sub: 'Bangla & English letters',Icon: BookOpen,      color: '#D97706', bg: '#FFF7ED',   route: '/learn-abc' },
  { label: 'Community',        sub: 'Parent forum',            Icon: Users,         color: '#4F46E5', bg: '#EEF2FF',   route: '/community' },
  { label: 'Myth Buster',      sub: 'Fact-check chatbot',      Icon: MessageCircle, color: '#0A0A0A', bg: '#F5F5F5',   route: '/chatbot' },
  { label: 'Emergency',        sub: 'Find the right facility', Icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2',   route: '/emergency' },
  { label: 'Dashboard',        sub: 'District health stats',   Icon: ClipboardList, color: '#737373', bg: '#F5F5F5',   route: '/dashboard' },
];

function PulseRing() {
  const opacity = useSharedValue(0.5);
  const scale = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0, { duration: 900 }), withTiming(0.5, { duration: 0 })), -1, false);
    scale.value = withRepeat(withSequence(withTiming(1.6, { duration: 900, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return <Animated.View style={[style, { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#0A0A0A', top: -4, left: -4 }]} />;
}

function AnimatedProgressBar({ value }: { value: number }) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(value, { duration: 1400, easing: Easing.out(Easing.cubic) }); }, []);
  const style = useAnimatedStyle(() => ({ width: `${progress.value}%` as any }));
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
      <Animated.View style={[style, { height: '100%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.9)' }]} />
    </View>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePress = () => {
    scale.value = withSpring(0.93, { damping: 12 }, () => { scale.value = withSpring(1); });
    setTimeout(() => router.push(feature.route as any), 80);
  };
  return (
    <Animated.View style={[style, { width: '47%' }]} entering={FadeInDown.duration(400).delay(600 + index * 50)}>
      <Pressable onPress={handlePress} style={{ backgroundColor: feature.bg, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E5E5E5', marginBottom: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <feature.Icon size={22} color={feature.color} strokeWidth={1.8} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 2 }}>{feature.label}</Text>
        <Text style={{ fontSize: 11, color: '#737373', lineHeight: 16 }}>{feature.sub}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [careItems, setCareItems] = useState(INITIAL_CARE);
  const [child, setChild] = useState<ChildData | null>(null);
  const [ageLabel, setAgeLabel] = useState('');

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChild(c);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
    });
  }, []);

  const doneCare = careItems.filter(i => i.done).length;
  const childName = child?.name ?? 'Your Child';
  const parentGreet = 'Sarah';

  const toggleItem = (id: string) => {
    setCareItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Greeting card ── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(50).springify()}
          style={{ backgroundColor: '#0A0A0A', marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}>
          <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -60, right: -60, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, bottom: -25, right: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => router.push('/child-info')} style={{ position: 'relative' }}>
                <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                  <Baby color="white" size={26} strokeWidth={1.5} />
                </View>
                {ageLabel ? (
                  <View style={{ position: 'absolute', bottom: -4, right: -6, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: '#0A0A0A', fontSize: 9, fontWeight: '900' }}>{ageLabel.split(' ')[0]}</Text>
                  </View>
                ) : null}
              </Pressable>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{childName}&apos;s Profile</Text>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Good morning, {parentGreet}!</Text>
              </View>
            </View>
            <Pressable style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Bell color="white" size={18} />
            </Pressable>
          </View>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 20 }}>
              Today&apos;s plan is ready —{' '}
              <Text style={{ fontWeight: '800', color: 'white' }}>3 activities</Text> and{' '}
              <Text style={{ fontWeight: '800', color: 'white' }}>1 feeding</Text> scheduled.
            </Text>
          </View>
        </Animated.View>

        {/* ── Quick stats ── */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 14 }}>
          {[
            { label: 'Last Feed', value: '2h ago',  Icon: Droplets, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Sleep',     value: '6.5 hrs', Icon: Moon,     color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Weight',    value: child?.weightKg ? `${child.weightKg} kg` : '—',  Icon: Baby, color: '#0A0A0A', bg: '#F5F5F5' },
          ].map((stat, i) => (
            <Animated.View key={stat.label} entering={FadeInDown.duration(400).delay(100 + i * 70).springify()} style={{ flex: 1, borderRadius: 18, padding: 12, alignItems: 'center', gap: 5, backgroundColor: stat.bg }}>
              <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: stat.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                <stat.Icon color={stat.color} size={16} strokeWidth={2} />
              </View>
              <Text style={{ color: '#0A0A0A', fontSize: 15, fontWeight: '800' }}>{stat.value}</Text>
              <Text style={{ color: '#737373', fontSize: 10, fontWeight: '600', textAlign: 'center' }}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* ── AI + Risk ── */}
        <Animated.View entering={FadeInDown.duration(450).delay(230)} style={{ paddingHorizontal: 16, marginTop: 14, gap: 10 }}>
          <View style={{ backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E5E5', height: 56 }}>
            <View style={{ position: 'relative', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
              <PulseRing />
              <Sparkles color="#0A0A0A" size={20} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: '#A3A3A3' }}>Ask NurtureAI… e.g. baby has mild fever</Text>
          </View>
          <Pressable onPress={() => router.push('/risk-report')} style={{ borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', height: 48 }}>
            <AlertTriangle color="#B91C1C" size={16} />
            <Text style={{ color: '#B91C1C', fontSize: 14, fontWeight: '700' }}>Run Risk Assessment →</Text>
          </Pressable>
        </Animated.View>

        {/* ── Milestone alert ── */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(290)}
          style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#FDE68A', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Lightbulb color="#D97706" size={17} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 3 }}>MILESTONE ALERT</Text>
            <Text style={{ color: '#92400E', fontSize: 14, fontWeight: '600', lineHeight: 20 }}>
              {childName} should start crawling soon! Try a floor activity today.
            </Text>
          </View>
          <Pressable onPress={() => router.push('/growth-check')}>
            <ChevronRight color="#D97706" size={18} />
          </Pressable>
        </Animated.View>

        {/* ── Today's Care ── */}
        <Animated.View entering={FadeInDown.duration(450).delay(340)} style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0A0A0A' }}>Today&apos;s Care</Text>
            <Pressable onPress={() => router.push('/care-guide')} style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: '#0A0A0A', fontSize: 12, fontWeight: '700' }}>{doneCare}/{careItems.length} Done</Text>
            </Pressable>
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5E5' }}>
            {careItems.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInRight.duration(350).delay(370 + idx * 55)}>
                <Pressable
                  onPress={() => toggleItem(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: idx < careItems.length - 1 ? 1 : 0, borderBottomColor: '#F5F5F5' }}>
                  <Checkbox.Root
                    checked={item.done}
                    onCheckedChange={() => toggleItem(item.id)}
                    style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: item.done ? '#0A0A0A' : '#D4D4D4', backgroundColor: item.done ? '#0A0A0A' : '#FAFAFA', alignItems: 'center', justifyContent: 'center' }}>
                    <Checkbox.Indicator style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Check color="white" size={12} strokeWidth={3} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: item.done ? '#A3A3A3' : '#0A0A0A', textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.label}</Text>
                  <Text style={{ color: '#A3A3A3', fontSize: 12 }}>{item.time}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ── Vaccination Banner ── */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(460)}
          style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#0A0A0A', borderRadius: 20, padding: 18, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, top: -30, right: -30, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 3 }}>VACCINATION TRACKER</Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Measles Vaccine</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 1 }}>9 Months · Due in 3 weeks</Text>
            </View>
            <Pressable onPress={() => router.push('/vaccination')} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Syringe color="white" size={18} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Schedule progress</Text>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>80%</Text>
          </View>
          <AnimatedProgressBar value={80} />
        </Animated.View>

        {/* ── All Features Grid ── */}
        <Animated.View entering={FadeInDown.duration(450).delay(520)} style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 4 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#0A0A0A', marginBottom: 14 }}>All Features</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.route} feature={feature} index={i} />
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}
