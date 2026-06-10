import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Activity, ArrowLeft, BedDouble, Droplets, RefreshCw, TrendingDown, TrendingUp, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface UpazilaData { name: string; district: string; beds: number; bedsAvail: number; oxygen: boolean; icuBeds: number; icuAvail: number; stunting: number; vaccination: number; activeCases: number; }

const MOCK_DATA: UpazilaData[] = [
  { name: 'Mirpur', district: 'Dhaka', beds: 60, bedsAvail: 12, oxygen: true, icuBeds: 8, icuAvail: 2, stunting: 28, vaccination: 89, activeCases: 14 },
  { name: 'Gulshan', district: 'Dhaka', beds: 45, bedsAvail: 22, oxygen: true, icuBeds: 6, icuAvail: 4, stunting: 18, vaccination: 94, activeCases: 5 },
  { name: 'Mohammadpur', district: 'Dhaka', beds: 55, bedsAvail: 8, oxygen: true, icuBeds: 4, icuAvail: 0, stunting: 32, vaccination: 82, activeCases: 21 },
  { name: 'Kotwali', district: 'Dhaka', beds: 80, bedsAvail: 31, oxygen: true, icuBeds: 10, icuAvail: 5, stunting: 25, vaccination: 91, activeCases: 9 },
  { name: 'Lalbagh', district: 'Dhaka', beds: 40, bedsAvail: 4, oxygen: false, icuBeds: 2, icuAvail: 0, stunting: 38, vaccination: 78, activeCases: 17 },
  { name: 'Khilkhet', district: 'Dhaka', beds: 35, bedsAvail: 18, oxygen: true, icuBeds: 3, icuAvail: 2, stunting: 22, vaccination: 87, activeCases: 7 },
  { name: 'Dohar', district: 'Dhaka', beds: 30, bedsAvail: 11, oxygen: false, icuBeds: 0, icuAvail: 0, stunting: 42, vaccination: 71, activeCases: 12 },
  { name: 'Nawabganj', district: 'Dhaka', beds: 25, bedsAvail: 9, oxygen: false, icuBeds: 0, icuAvail: 0, stunting: 45, vaccination: 68, activeCases: 19 },
];

type View2 = 'beds' | 'nutrition' | 'vaccination';

function StatCard({ label, value, sub, Icon, color, delay }: { label: string; value: string; sub: string; Icon: any; color: string; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 16, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Icon size={18} color={color} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#0A0A0A' }}>{value}</Text>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#0A0A0A', marginTop: 1 }}>{label}</Text>
      <Text style={{ fontSize: 11, color: '#A3A3A3', marginTop: 2 }}>{sub}</Text>
    </Animated.View>
  );
}

function OccBar({ total, avail, delay }: { total: number; avail: number; delay: number }) {
  const w = useSharedValue(0);
  const st = useAnimatedStyle(() => ({ width: `${w.value}%` as any }));
  const pct = total > 0 ? Math.round(((total - avail) / total) * 100) : 0;
  const color = pct > 85 ? '#DC2626' : pct > 60 ? '#D97706' : '#0A0A0A';
  useEffect(() => { w.value = withTiming(pct, { duration: 800 }); }, [pct]);
  return (
    <View style={{ height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <Animated.View style={[{ height: '100%', borderRadius: 4, backgroundColor: color }, st]} />
    </View>
  );
}

export default function DashboardScreen() {
  const [activeView, setActiveView] = useState<View2>('beds');
  const [lastRefresh, setLastRefresh] = useState('Just now');

  const totalBeds = MOCK_DATA.reduce((a, u) => a + u.beds, 0);
  const availBeds = MOCK_DATA.reduce((a, u) => a + u.bedsAvail, 0);
  const oxygenUp = MOCK_DATA.filter(u => u.oxygen).length;
  const avgVacc = Math.round(MOCK_DATA.reduce((a, u) => a + u.vaccination, 0) / MOCK_DATA.length);
  const avgStunting = Math.round(MOCK_DATA.reduce((a, u) => a + u.stunting, 0) / MOCK_DATA.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Health Dashboard</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>Dhaka District · Updated {lastRefresh}</Text>
        </View>
        <Pressable onPress={() => setLastRefresh('Just now')} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={16} color="#737373" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Summary stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(40)} style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <StatCard label="Total Beds" value={`${availBeds}/${totalBeds}`} sub="available now" Icon={BedDouble} color="#0A0A0A" delay={60} />
          <StatCard label="Oxygen Units" value={`${oxygenUp}/${MOCK_DATA.length}`} sub="upazilas online" Icon={Droplets} color="#2563EB" delay={100} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <StatCard label="Vaccination Rate" value={`${avgVacc}%`} sub="avg. district coverage" Icon={Activity} color="#7C3AED" delay={120} />
          <StatCard label="Stunting Rate" value={`${avgStunting}%`} sub="avg. under-5 district" Icon={Users} color="#D97706" delay={160} />
        </Animated.View>

        {/* View toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {([['beds', 'Bed Availability'], ['nutrition', 'Stunting'], ['vaccination', 'Vaccination']] as const).map(([key, label]) => (
            <Pressable key={key} onPress={() => setActiveView(key)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: activeView === key ? '#0A0A0A' : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: activeView === key ? 'white' : '#737373' }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Upazila list */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A', marginBottom: 10 }}>Upazila Breakdown</Text>
        {MOCK_DATA.map((u, i) => (
          <Animated.View key={u.name} entering={FadeInDown.duration(400).delay(80 + i * 50)} style={{ borderRadius: 14, borderWidth: 1, borderColor: '#E5E5E5', padding: 14, marginBottom: 8, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0A0A0A' }}>{u.name}</Text>
                <Text style={{ fontSize: 11, color: '#A3A3A3' }}>{u.district} District</Text>
              </View>
              {activeView === 'beds' && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: u.bedsAvail < 5 ? '#DC2626' : '#0A0A0A' }}>{u.bedsAvail} free</Text>
                  <Text style={{ fontSize: 11, color: '#A3A3A3' }}>of {u.beds} beds</Text>
                </View>
              )}
              {activeView === 'nutrition' && (
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {u.stunting > 35 ? <TrendingUp size={14} color="#DC2626" /> : <TrendingDown size={14} color="#0A0A0A" />}
                  <Text style={{ fontSize: 15, fontWeight: '800', color: u.stunting > 35 ? '#DC2626' : '#0A0A0A' }}>{u.stunting}%</Text>
                </View>
              )}
              {activeView === 'vaccination' && (
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {u.vaccination >= 85 ? <TrendingUp size={14} color="#0A0A0A" /> : <TrendingDown size={14} color="#D97706" />}
                  <Text style={{ fontSize: 15, fontWeight: '800', color: u.vaccination >= 85 ? '#0A0A0A' : '#D97706' }}>{u.vaccination}%</Text>
                </View>
              )}
            </View>

            {activeView === 'beds' && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: '#737373', width: 50 }}>Beds</Text>
                  <OccBar total={u.beds} avail={u.bedsAvail} delay={0} />
                  <Text style={{ fontSize: 11, color: '#737373', width: 32, textAlign: 'right' }}>{Math.round(((u.beds - u.bedsAvail) / u.beds) * 100)}%</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: u.oxygen ? '#0A0A0A' : '#DC2626', marginLeft: 1 }} />
                  <Text style={{ fontSize: 12, color: u.oxygen ? '#0A0A0A' : '#DC2626', fontWeight: '600' }}>
                    {u.oxygen ? 'Oxygen supply: Available' : 'Oxygen supply: Unavailable'}
                  </Text>
                </View>
              </View>
            )}
            {activeView === 'nutrition' && (
              <Text style={{ fontSize: 12, color: '#374151' }}>
                Under-5 stunting rate: <Text style={{ fontWeight: '700' }}>{u.stunting}%</Text> · Active nutritional cases: {u.activeCases}
              </Text>
            )}
            {activeView === 'vaccination' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 11, color: '#737373', width: 54 }}>Coverage</Text>
                <View style={{ flex: 1, height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${u.vaccination}%`, backgroundColor: u.vaccination >= 85 ? '#0A0A0A' : '#D97706', borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 11, color: '#737373', width: 32, textAlign: 'right' }}>{u.vaccination}%</Text>
              </View>
            )}
          </Animated.View>
        ))}

        {/* Disclaimer */}
        <View style={{ backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: '#737373', lineHeight: 19 }}>Data shown is simulated for demonstration. In the deployed version, this dashboard connects to the DGHS (Directorate General of Health Services) real-time API. Bed availability updates every 15 minutes.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
