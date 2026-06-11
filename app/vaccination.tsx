import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { recordVaccination, fetchVaccinations } from '@/lib/api';
import { formatAge, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, Lock, Shield } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/header'

const DOSE_META: Record<string, { fullName: string; ageMonths: number; ageLabel: string; protects: string }> = {
  'BCG':             { fullName: 'Bacillus Calmette-Guérin', ageMonths: 0, ageLabel: 'At Birth', protects: 'Tuberculosis' },
  'OPV 0':           { fullName: 'Oral Polio Vaccine (birth dose)', ageMonths: 0, ageLabel: 'At Birth', protects: 'Polio' },
  'OPV 1':           { fullName: 'Oral Polio Vaccine (dose 1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Polio' },
  'OPV 2':           { fullName: 'Oral Polio Vaccine (dose 2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Polio' },
  'OPV 3':           { fullName: 'Oral Polio Vaccine (dose 3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Polio' },
  'Penta 1':         { fullName: 'Pentavalent Vaccine (dose 1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib' },
  'Penta 2':         { fullName: 'Pentavalent Vaccine (dose 2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib' },
  'Penta 3':         { fullName: 'Pentavalent Vaccine (dose 3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib' },
  'PCV 1':           { fullName: 'Pneumococcal Conjugate Vaccine (dose 1)', ageMonths: 1.5, ageLabel: '6 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)' },
  'PCV 2':           { fullName: 'Pneumococcal Conjugate Vaccine (dose 2)', ageMonths: 2.5, ageLabel: '10 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)' },
  'PCV 3':           { fullName: 'Pneumococcal Conjugate Vaccine (dose 3)', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Pneumonia & Meningitis (Pneumococcal)' },
  'PCV Booster':     { fullName: 'Pneumococcal Conjugate Vaccine (booster)', ageMonths: 12, ageLabel: '12 Months', protects: 'Pneumonia & Meningitis (Pneumococcal)' },
  'IPV':             { fullName: 'Inactivated Polio Vaccine', ageMonths: 3.5, ageLabel: '14 Weeks', protects: 'Polio' },
  'MR 1':            { fullName: 'Measles-Rubella (dose 1)', ageMonths: 9, ageLabel: '9 Months', protects: 'Measles & Rubella' },
  'MR 2':            { fullName: 'Measles-Rubella (dose 2)', ageMonths: 15, ageLabel: '15 Months', protects: 'Measles & Rubella' },
  'JE':              { fullName: 'Japanese Encephalitis Vaccine', ageMonths: 15, ageLabel: '15 Months', protects: 'Japanese Encephalitis' },
  'Vitamin A (6m)':  { fullName: 'Vitamin A Supplement', ageMonths: 6, ageLabel: '6 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (12m)': { fullName: 'Vitamin A Supplement', ageMonths: 12, ageLabel: '12 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (18m)': { fullName: 'Vitamin A Supplement', ageMonths: 18, ageLabel: '18 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (24m)': { fullName: 'Vitamin A Supplement', ageMonths: 24, ageLabel: '24 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (30m)': { fullName: 'Vitamin A Supplement', ageMonths: 30, ageLabel: '30 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (36m)': { fullName: 'Vitamin A Supplement', ageMonths: 36, ageLabel: '36 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (42m)': { fullName: 'Vitamin A Supplement', ageMonths: 42, ageLabel: '42 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (48m)': { fullName: 'Vitamin A Supplement', ageMonths: 48, ageLabel: '48 Months', protects: 'Vitamin A Deficiency' },
  'Vitamin A (54m)': { fullName: 'Vitamin A Supplement', ageMonths: 54, ageLabel: '54 Months', protects: 'Vitamin A Deficiency' },
};

const FALLBACK_SCHEDULE = [
  { nameEn: 'BCG' }, { nameEn: 'OPV 0' }, { nameEn: 'Penta 1' }, { nameEn: 'PCV 1' },
  { nameEn: 'OPV 1' }, { nameEn: 'Penta 2' }, { nameEn: 'PCV 2' }, { nameEn: 'OPV 2' },
  { nameEn: 'Penta 3' }, { nameEn: 'PCV 3' }, { nameEn: 'OPV 3' }, { nameEn: 'IPV' },
  { nameEn: 'MR 1' }, { nameEn: 'MR 2' }, { nameEn: 'JE' },
];

interface VaccRecord {
  id: number;
  nameEn: string;
  fullName: string;
  ageMonths: number;
  ageLabel: string;
  protects: string;
  isGiven: boolean;
  givenDate: string | null;
  facilityName: string | null;
}

function buildFromBackend(raw: any): VaccRecord {
  const nameEn: string = raw.vaccineDose.nameEn;
  const meta = DOSE_META[nameEn];
  const fallbackMonths = raw.vaccineDose.eligibleAgeDays / 30.44;
  return {
    id: raw.id,
    nameEn,
    fullName: meta?.fullName ?? nameEn,
    ageMonths: meta?.ageMonths ?? fallbackMonths,
    ageLabel: meta?.ageLabel ?? `${Math.round(fallbackMonths)} months`,
    protects: meta?.protects ?? '',
    isGiven: raw.isGiven,
    givenDate: raw.givenDate ?? null,
    facilityName: raw.facilityName ?? null,
  };
}

function buildFromFallback(childAgeMonths: number): VaccRecord[] {
  return FALLBACK_SCHEDULE.map((item, i) => {
    const meta = DOSE_META[item.nameEn]!;
    return {
      id: -(i + 1),
      nameEn: item.nameEn,
      fullName: meta.fullName,
      ageMonths: meta.ageMonths,
      ageLabel: meta.ageLabel,
      protects: meta.protects,
      isGiven: meta.ageMonths <= childAgeMonths - 0.5,
      givenDate: null,
      facilityName: null,
    };
  });
}

function VaccCard({ r, index, onPress }: { r: VaccRecord; index: number; onPress: (r: VaccRecord) => void }) {
  const isGiven = r.isGiven;
  const givenDateLabel = r.givenDate
    ? new Date(r.givenDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(80 + index * 50)}>
      <Pressable
        onPress={isGiven ? undefined : () => onPress(r)}
        style={{
          flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 8,
          borderRadius: 14, borderWidth: 1.5,
          borderColor: isGiven ? '#0A0A0A' : '#E5E5E5',
          backgroundColor: isGiven ? '#F5F5F5' : '#FFFFFF',
        }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isGiven ? '#0F5238' : '#F5F5F5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isGiven ? <CheckCircle size={18} color="white" /> : <Shield size={18} color="#A3A3A3" />}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isGiven ? '#737373' : '#0A0A0A' }}>{r.nameEn}</Text>
            <View style={{ backgroundColor: isGiven ? '#E5E5E5' : '#F5F5F5', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, color: '#737373', fontWeight: '600' }}>{r.ageLabel}</Text>
            </View>
            {isGiven && <Lock size={11} color="#A3A3A3" />}
          </View>
          <Text style={{ fontSize: 12, color: '#737373', marginBottom: 3 }}>{r.fullName}</Text>
          {r.protects ? <Text style={{ fontSize: 12, color: '#374151' }}>Protects against: {r.protects}</Text> : null}
          {isGiven && (
            <Text style={{ fontSize: 11, color: '#A3A3A3', marginTop: 4 }}>
              {givenDateLabel ?? 'Date not recorded'}{r.facilityName ? ` · ${r.facilityName}` : ''}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function VaccinationScreen() {
  const [childName, setChildName] = useState('Your Child');
  const [childAgeLbl, setChildAgeLbl] = useState('');
  const [childAgeMonths, setChildAgeMonths] = useState(0);
  const [records, setRecords] = useState<VaccRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogRecord, setDialogRecord] = useState<VaccRecord | null>(null);
  const [givenDate, setGivenDate] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const child = await loadChild();
      if (!child || cancelled) return;

      setChildName(child.name);
      const months = getAgeMonths(child.dob);
      setChildAgeMonths(months);
      setChildAgeLbl(formatAge(months));

      try {
        const data = await fetchVaccinations(child.id);
        if (!cancelled) setRecords(data.records.map(buildFromBackend));
      } catch {
        if (!cancelled) setRecords(buildFromFallback(months));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openDialog = (record: VaccRecord) => {
    setDialogRecord(record);
    setGivenDate(new Date().toISOString().slice(0, 10));
    setFacilityName('');
    setFormError('');
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogRecord(null);
  };

  const submitRecord = async () => {
    if (!dialogRecord) return;
    if (!givenDate.trim()) { setFormError('Date is required'); return; }
    const parsed = new Date(givenDate.trim());
    if (isNaN(parsed.getTime())) { setFormError('Enter a valid date (YYYY-MM-DD)'); return; }
    if (dialogRecord.id < 0) { setFormError('Cannot save — no connection to server'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const updated = await recordVaccination(dialogRecord.id, givenDate.trim(), facilityName.trim() || undefined);
      setRecords(prev => prev.map(r =>
        r.id === dialogRecord.id
          ? { ...r, isGiven: true, givenDate: updated.givenDate, facilityName: updated.facilityName }
          : r
      ));
      setDialogRecord(null);
    } catch (e: any) {
      setFormError(e.message || 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const dueNow = records.filter(r => !r.isGiven && r.ageMonths >= childAgeMonths - 0.5 && r.ageMonths <= childAgeMonths + 2);
  const upcoming = records.filter(r => !r.isGiven && r.ageMonths > childAgeMonths + 2);
  const completed = records.filter(r => r.isGiven);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <Header title="Vaccinations" emoji="💉" />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0A0A0A" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
          <Animated.View entering={FadeInDown.duration(400).delay(40)} style={{ backgroundColor: '#rgba(15, 82, 56,0.9)', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', gap: 12 }}>
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

          <Text style={{ fontSize: 11, color: '#A3A3A3', marginBottom: 16 }}>Tap a vaccine to record it. Once recorded it cannot be changed. Based on Bangladesh EPI schedule.</Text>

          {dueNow.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={14} color="#D97706" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706' }}>Due Now / This Month</Text>
              </View>
              {dueNow.map((r, i) => <VaccCard key={r.id} r={r} index={i} onPress={openDialog} />)}
            </>
          )}

          {completed.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
                <CheckCircle size={14} color="#0A0A0A" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A' }}>Completed</Text>
              </View>
              {completed.map((r, i) => <VaccCard key={r.id} r={r} index={i} onPress={openDialog} />)}
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
                <Shield size={14} color="#737373" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#737373' }}>Upcoming</Text>
              </View>
              {upcoming.map((r, i) => <VaccCard key={r.id} r={r} index={i} onPress={openDialog} />)}
            </>
          )}

          <View style={{ backgroundColor: '#F5F5F5', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#D4D4D4' }}>
            <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>All vaccines are available free of charge at Community Clinics, Union Health and Family Welfare Centres, and Upazila Health Complexes across Bangladesh.</Text>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={!!dialogRecord}
        transparent
        animationType="fade"
        onRequestClose={closeDialog}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Backdrop — tap to dismiss */}
          <Pressable
            onPress={closeDialog}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            {/* Card — stop propagation so tapping inside doesn't dismiss */}
            <Pressable
              onPress={() => {}}
              style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, gap: 20 }}
            >
              {/* Header */}
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>{dialogRecord?.nameEn}</Text>
                <Text style={{ fontSize: 13, color: '#737373' }}>{dialogRecord?.fullName}</Text>
                {dialogRecord?.protects ? (
                  <Text style={{ fontSize: 12, color: '#374151' }}>Protects against: {dialogRecord.protects}</Text>
                ) : null}
              </View>

              {/* Fields */}
              <View style={{ gap: 14 }}>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0A0A0A' }}>Date given</Text>
                  <Input
                    value={givenDate}
                    onChangeText={setGivenDate}
                    placeholder="YYYY-MM-DD"
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0A0A0A' }}>
                    Facility name{' '}
                    <Text style={{ fontSize: 13, color: '#A3A3A3', fontWeight: '400' }}>(optional)</Text>
                  </Text>
                  <Input
                    value={facilityName}
                    onChangeText={setFacilityName}
                    placeholder="e.g. Mirpur Community Clinic"
                    autoCorrect={false}
                  />
                </View>

                {formError ? (
                  <Text style={{ fontSize: 13, color: '#DC2626' }}>{formError}</Text>
                ) : null}
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button variant="outline" onPress={closeDialog} style={{ flex: 1 }} disabled={submitting}>
                  <Text>Cancel</Text>
                </Button>
                <Button className='bg-brand-hero' onPress={submitRecord} style={{ flex: 1 }} disabled={submitting || !givenDate.trim()}>
                  <Text>{submitting ? 'Saving…' : 'Record'}</Text>
                </Button>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
