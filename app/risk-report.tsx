import { Text } from '@/components/ui/text';
import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle, Info, ShieldCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type RiskLevel = 'low' | 'moderate' | 'high';

interface RiskFactor { label: string; status: 'ok' | 'warn' | 'risk'; detail: string; }

function computeRisk(weightKg: number, heightCm: number, ageMonths: number, bracket: string): { level: RiskLevel; score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];
  let riskPoints = 0;

  // Weight-for-age (simplified WHO thresholds)
  if (weightKg > 0 && ageMonths > 0) {
    const expectedWeight = ageMonths < 12
      ? 3.3 + ageMonths * 0.7
      : 9.6 + (ageMonths - 12) * 0.22;
    const ratio = weightKg / expectedWeight;
    if (ratio < 0.7) { factors.push({ label: 'Severe Underweight', status: 'risk', detail: `Weight ${weightKg}kg is significantly below expected ~${expectedWeight.toFixed(1)}kg for age.` }); riskPoints += 3; }
    else if (ratio < 0.85) { factors.push({ label: 'Moderate Underweight', status: 'warn', detail: `Weight is below the healthy range for this age. Ensure adequate feeding.` }); riskPoints += 1; }
    else { factors.push({ label: 'Weight Normal', status: 'ok', detail: `Weight ${weightKg}kg is within expected range.` }); }
  } else {
    factors.push({ label: 'Weight Not Recorded', status: 'warn', detail: 'Add weight to improve accuracy of risk prediction.' });
    riskPoints += 1;
  }

  // Height-for-age (simplified)
  if (heightCm > 0 && ageMonths > 0) {
    const expectedHeight = ageMonths < 12
      ? 50 + ageMonths * 2.5
      : 75 + (ageMonths - 12) * 0.9;
    const ratio = heightCm / expectedHeight;
    if (ratio < 0.9) { factors.push({ label: 'Stunting Risk', status: 'risk', detail: `Height ${heightCm}cm is below the −2 SD threshold for age. Seek nutrition counselling.` }); riskPoints += 2; }
    else if (ratio < 0.95) { factors.push({ label: 'Borderline Height', status: 'warn', detail: 'Monitor height at each visit.' }); riskPoints += 1; }
    else { factors.push({ label: 'Height Normal', status: 'ok', detail: `Height ${heightCm}cm is within the healthy range.` }); }
  } else {
    factors.push({ label: 'Height Not Recorded', status: 'warn', detail: 'Add height to improve risk assessment.' });
    riskPoints += 1;
  }

  // Age bracket specific
  if (bracket === 'prenatal') {
    factors.push({ label: 'Prenatal Stage', status: 'warn', detail: 'Ensure regular antenatal check-ups and iron/folic acid supplementation.' });
    riskPoints += 1;
  }
  if (bracket === '0-1m') {
    factors.push({ label: 'Neonatal Period', status: 'warn', detail: 'Highest risk window. Watch for breathing difficulty, jaundice, and feeding problems.' });
    riskPoints += 1;
  }

  const score = Math.min(Math.round((riskPoints / 8) * 100), 100);
  const level: RiskLevel = riskPoints >= 5 ? 'high' : riskPoints >= 2 ? 'moderate' : 'low';

  return { level, score, factors };
}

const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string; border: string; Icon: any; advice: string }> = {
  low:      { label: 'Low Risk',      color: '#0A0A0A', bg: '#F5F5F5', border: '#D4D4D4', Icon: ShieldCheck, advice: 'Your child is growing well. Continue regular check-ups and vaccinations.' },
  moderate: { label: 'Moderate Risk', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', Icon: AlertTriangle, advice: 'Some factors need attention. Visit your nearest Community Clinic within 2 weeks.' },
  high:     { label: 'High Risk',     color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', Icon: AlertTriangle, advice: 'Immediate action recommended. Visit your Upazila Health Complex or district hospital.' },
};

function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  const width = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));
  useEffect(() => { width.value = withTiming(percent, { duration: 900 }); }, [percent]);
  return (
    <View style={{ height: 10, backgroundColor: '#E5E5E5', borderRadius: 5, overflow: 'hidden', marginTop: 6 }}>
      <Animated.View style={[{ height: '100%', borderRadius: 5, backgroundColor: color }, style]} />
    </View>
  );
}

export default function RiskReportScreen() {
  const [childName, setChildName] = useState('Your Child');
  const [ageLabel, setAgeLabel] = useState('');
  const [result, setResult] = useState<ReturnType<typeof computeRisk> | null>(null);

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChildName(c.name);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
      setResult(computeRisk(c.weightKg, c.heightCm, m, getAgeBracket(m)));
    });
  }, []);

  if (!result) return null;

  const meta = RISK_META[result.level];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Risk Report</Text>
          {ageLabel ? <Text style={{ fontSize: 12, color: '#737373' }}>{childName} · {ageLabel}</Text> : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Risk score card */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: meta.bg, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: meta.border, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: meta.color, alignItems: 'center', justifyContent: 'center' }}>
              <meta.Icon size={24} color="white" strokeWidth={2} />
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: meta.color }}>{meta.label}</Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>Risk Score: {result.score}/100</Text>
            </View>
          </View>
          <AnimatedBar percent={result.score} color={meta.color} />
          <Text style={{ marginTop: 14, fontSize: 14, color: '#374151', lineHeight: 21 }}>{meta.advice}</Text>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ flexDirection: 'row', gap: 10, backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, marginBottom: 20 }}>
          <Info size={15} color="#737373" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 12, color: '#737373', lineHeight: 18 }}>This screening uses WHO-based thresholds. It does not replace a clinical diagnosis. Always consult a health worker for medical decisions.</Text>
        </Animated.View>

        {/* Factor breakdown */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 12 }}>Factor Breakdown</Text>
        {result.factors.map((f, i) => {
          const iconColor = f.status === 'ok' ? '#0A0A0A' : f.status === 'warn' ? '#D97706' : '#DC2626';
          const bgColor = f.status === 'ok' ? '#F5F5F5' : f.status === 'warn' ? '#FFFBEB' : '#FEF2F2';
          return (
            <Animated.View key={f.label} entering={FadeInDown.duration(400).delay(160 + i * 70)} style={{ backgroundColor: bgColor, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {f.status === 'ok' ? <CheckCircle size={16} color={iconColor} /> : <AlertTriangle size={16} color={iconColor} />}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>{f.label}</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#374151', lineHeight: 19 }}>{f.detail}</Text>
            </Animated.View>
          );
        })}

        {/* CTA */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={{ marginTop: 8 }}>
          <Pressable onPress={() => router.push('/vaccination')} style={{ backgroundColor: '#0A0A0A', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>View Vaccination Status →</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/emergency')} style={{ borderWidth: 1.5, borderColor: '#DC2626', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: '700' }}>Emergency Facility Finder →</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
