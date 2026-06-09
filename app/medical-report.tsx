import { Text } from '@/components/ui/text';
import { formatAge, getAgeMonths, loadChild, type ChildData } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Download, FileText, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

function Section({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#737373', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{title}</Text>
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#E5E5E5', overflow: 'hidden' }}>
        {children}
      </View>
    </Animated.View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#F5F5F5' }}>
      <Text style={{ fontSize: 13, color: '#737373', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0A0A0A', flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const MOCK_FEEDINGS = [
  { date: '2025-12-18', type: 'Breastfeed', duration: '15 min', notes: 'Good latch' },
  { date: '2025-12-18', type: 'Breastfeed', duration: '12 min', notes: '' },
  { date: '2025-12-17', type: 'Khichuri', duration: '80g', notes: 'Finished half bowl' },
];
const MOCK_SLEEP = [
  { date: '2025-12-18', start: '21:00', end: '05:00', hours: '8h' },
  { date: '2025-12-18', start: '13:00', end: '15:00', hours: '2h' },
];
const MOCK_GROWTH = [
  { date: '2025-12-01', weight: '8.2 kg', height: '70 cm', hc: '44.5 cm' },
  { date: '2025-11-01', weight: '7.9 kg', height: '68.5 cm', hc: '44.0 cm' },
];
const MOCK_CONDITIONS = 'No chronic conditions reported.';
const MOCK_ALLERGIES = 'No known allergies.';

export default function MedicalReportScreen() {
  const [child, setChild] = useState<ChildData | null>(null);
  const [ageLabel, setAgeLabel] = useState('');
  const [reportDate] = useState(new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' }));

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChild(c);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
    });
  }, []);

  const handleExport = () => {
    Alert.alert(
      'Export Report',
      'In the full app, this generates a PDF report that can be shared with health workers or printed. This feature requires internet access.',
      [{ text: 'OK' }]
    );
  };

  if (!child) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#737373', fontSize: 15 }}>No child profile found. Please add a child first.</Text>
        <Pressable onPress={() => router.push('/child-info')} style={{ marginTop: 16, backgroundColor: '#0A0A0A', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Add Child Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Medical Report</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>Generated {reportDate}</Text>
        </View>
        <Pressable onPress={handleExport} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={18} color="white" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Header card */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} color="white" strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>{child.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{ageLabel}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>ShishuCare Health Record</Text>
          </View>
        </Animated.View>

        {/* Child details */}
        <Section title="Child Information" delay={80}>
          <Row label="Name" value={child.name} />
          <Row label="Date of Birth" value={new Date(child.dob).toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <Row label="Gender" value={child.gender.charAt(0).toUpperCase() + child.gender.slice(1)} />
          <Row label="Age" value={ageLabel} />
          <Row label="Journey" value={child.journeyType === 'prenatal' ? 'Prenatal' : 'Postnatal'} />
          <Row label="Last Weight" value={child.weightKg > 0 ? `${child.weightKg} kg` : 'Not recorded'} />
          <Row label="Last Height" value={child.heightCm > 0 ? `${child.heightCm} cm` : 'Not recorded'} last />
        </Section>

        {/* Medical background */}
        <Section title="Medical Background" delay={130}>
          <Row label="Chronic Conditions" value={MOCK_CONDITIONS} />
          <Row label="Allergies" value={MOCK_ALLERGIES} last />
        </Section>

        {/* Growth records */}
        <Section title="Growth Records" delay={170}>
          {MOCK_GROWTH.map((g, i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i === MOCK_GROWTH.length - 1 ? 0 : 1, borderBottomColor: '#F5F5F5' }}>
              <Text style={{ flex: 1, fontSize: 12, color: '#737373' }}>{g.date}</Text>
              <Text style={{ fontSize: 12, color: '#0A0A0A', fontWeight: '600' }}>Wt: {g.weight}</Text>
              <Text style={{ fontSize: 12, color: '#0A0A0A', fontWeight: '600', marginLeft: 12 }}>Ht: {g.height}</Text>
            </View>
          ))}
        </Section>

        {/* Recent feeding */}
        <Section title="Recent Feeding Logs" delay={210}>
          {MOCK_FEEDINGS.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i === MOCK_FEEDINGS.length - 1 ? 0 : 1, borderBottomColor: '#F5F5F5', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#0A0A0A', fontWeight: '600' }}>{f.type}</Text>
                {f.notes ? <Text style={{ fontSize: 11, color: '#737373' }}>{f.notes}</Text> : null}
              </View>
              <Text style={{ fontSize: 12, color: '#737373' }}>{f.date} · {f.duration}</Text>
            </View>
          ))}
        </Section>

        {/* Recent sleep */}
        <Section title="Recent Sleep Logs" delay={250}>
          {MOCK_SLEEP.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i === MOCK_SLEEP.length - 1 ? 0 : 1, borderBottomColor: '#F5F5F5', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#0A0A0A', fontWeight: '600' }}>{s.date}</Text>
                <Text style={{ fontSize: 11, color: '#737373' }}>{s.start} – {s.end}</Text>
              </View>
              <View style={{ backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>{s.hours}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* Export button */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Pressable onPress={handleExport} style={{ backgroundColor: '#0A0A0A', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <FileText size={18} color="white" />
            <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Export as PDF</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
