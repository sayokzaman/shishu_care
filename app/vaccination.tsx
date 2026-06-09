import { Text } from '@/components/ui/text';
import { formatAge, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, Shield } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Vaccine {
  id: string;
  name: string;
  fullName: string;
  ageMonths: number;
  ageLabel: string;
  protects: string;
  doses: number;
  doseNum: number;
}

const EPI_SCHEDULE: Vaccine[] = [
  { id: 'bcg', name: 'BCG', fullName: 'Bacillus Calmette-Guérin', ageMonths: 0, ageLabel: 'At Birth', protects: 'Tuberculosis', doses: 1, doseNum: 1 },
  { id: 'opv0', name: 'OPV 0', fullName: 'Oral Polio Vaccine (0)', ageMonths: 0, ageLabel: 'At Birth', protects: 'Polio', doses: 5, doseNum: 1 },
  { id: 'penta1', name: 'Penta 1', fullName: 'Pentavalent Vaccine (dose 1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib', doses: 3, doseNum: 1 },
  { id: 'pcv1', name: 'PCV 1', fullName: 'Pneumococcal Conjugate Vaccine (dose 1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)', doses: 3, doseNum: 1 },
  { id: 'opv1', name: 'OPV 1', fullName: 'Oral Polio Vaccine (1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Polio', doses: 5, doseNum: 2 },
  { id: 'penta2', name: 'Penta 2', fullName: 'Pentavalent Vaccine (dose 2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib', doses: 3, doseNum: 2 },
  { id: 'pcv2', name: 'PCV 2', fullName: 'Pneumococcal Conjugate Vaccine (dose 2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)', doses: 3, doseNum: 2 },
  { id: 'opv2', name: 'OPV 2', fullName: 'Oral Polio Vaccine (2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Polio', doses: 5, doseNum: 3 },
  { id: 'penta3', name: 'Penta 3', fullName: 'Pentavalent Vaccine (dose 3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib', doses: 3, doseNum: 3 },
  { id: 'pcv3', name: 'PCV 3', fullName: 'Pneumococcal Conjugate Vaccine (dose 3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)', doses: 3, doseNum: 3 },
  { id: 'opv3', name: 'OPV 3', fullName: 'Oral Polio Vaccine (3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Polio', doses: 5, doseNum: 4 },
  { id: 'ipv', name: 'IPV', fullName: 'Inactivated Polio Vaccine', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Polio', doses: 1, doseNum: 1 },
  { id: 'mr1', name: 'MR 1', fullName: 'Measles-Rubella (dose 1)', ageMonths: 9, ageLabel: '9 Months', protects: 'Measles & Rubella', doses: 2, doseNum: 1 },
  { id: 'mr2', name: 'MR 2', fullName: 'Measles-Rubella (dose 2)', ageMonths: 15, ageLabel: '15 Months', protects: 'Measles & Rubella', doses: 2, doseNum: 2 },
  { id: 'je', name: 'JE', fullName: 'Japanese Encephalitis Vaccine', ageMonths: 15, ageLabel: '15 Months', protects: 'Japanese Encephalitis', doses: 1, doseNum: 1 },
];

export default function VaccinationScreen() {
  const [childName, setChildName] = useState('Your Child');
  const [ageLabel, setAgeLabel] = useState('');
  const [ageMonths, setAgeMonths] = useState(6);
  const [given, setGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChildName(c.name);
      const m = getAgeMonths(c.dob);
      setAgeMonths(m);
      setAgeLabel(formatAge(m));
      const auto = new Set<string>();
      EPI_SCHEDULE.forEach(v => { if (v.ageMonths <= m - 0.5) auto.add(v.id); });
      setGiven(auto);
    });
  }, []);

  const toggle = (id: string) => setGiven(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const dueNow = EPI_SCHEDULE.filter(v => v.ageMonths >= ageMonths - 0.5 && v.ageMonths <= ageMonths + 2);
  const upcoming = EPI_SCHEDULE.filter(v => v.ageMonths > ageMonths + 2);
  const completed = EPI_SCHEDULE.filter(v => given.has(v.id));

  const VaccCard = ({ v, index, showCheck }: { v: Vaccine; index: number; showCheck: boolean }) => {
    const isGiven = given.has(v.id);
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(80 + index * 50)}>
        <Pressable onPress={() => toggle(v.id)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 8, borderRadius: 14, borderWidth: 1.5, borderColor: isGiven ? '#0A0A0A' : '#E5E5E5', backgroundColor: isGiven ? '#F5F5F5' : '#FFFFFF' }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isGiven ? '#0A0A0A' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isGiven ? <CheckCircle size={18} color="white" /> : <Shield size={18} color="#A3A3A3" />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: isGiven ? '#737373' : '#0A0A0A' }}>{v.name}</Text>
              <View style={{ backgroundColor: isGiven ? '#E5E5E5' : '#F5F5F5', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, color: '#737373', fontWeight: '600' }}>{v.ageLabel}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#737373', marginBottom: 3 }}>{v.fullName}</Text>
            <Text style={{ fontSize: 12, color: '#374151' }}>Protects against: {v.protects}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Vaccination Tracker</Text>
          {ageLabel ? <Text style={{ fontSize: 12, color: '#737373' }}>{childName} · {ageLabel}</Text> : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Summary */}
        <Animated.View entering={FadeInDown.duration(400).delay(40)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>{completed.length}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Given</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>{dueNow.length}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Due Now</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900' }}>{upcoming.length}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Upcoming</Text>
          </View>
        </Animated.View>

        <Text style={{ fontSize: 11, color: '#A3A3A3', marginBottom: 16 }}>Tap any vaccine to mark as given / not given. Based on Bangladesh EPI schedule.</Text>

        {dueNow.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Clock size={14} color="#D97706" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>Due Now / This Month</Text>
            </View>
            {dueNow.map((v, i) => <VaccCard key={v.id} v={v} index={i} showCheck />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
              <CheckCircle size={14} color="#0A0A0A" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>Completed</Text>
            </View>
            {completed.map((v, i) => <VaccCard key={v.id} v={v} index={i} showCheck />)}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
              <Shield size={14} color="#737373" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#737373' }}>Upcoming</Text>
            </View>
            {upcoming.map((v, i) => <VaccCard key={v.id} v={v} index={i} showCheck={false} />)}
          </>
        )}

        <View style={{ backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#D4D4D4' }}>
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>All vaccines are available free of charge at Community Clinics, Union Health and Family Welfare Centres, and Upazila Health Complexes across Bangladesh.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
