import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { AlertTriangle, ArrowLeft, MapPin, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Urgency = 'critical' | 'urgent' | 'moderate';

interface Symptom { id: string; label: string; urgency: Urgency; emoji: string; }
interface Facility { name: string; type: string; distance: string; phone?: string; note?: string; }

const SYMPTOMS: Symptom[] = [
  { id: 's1', label: 'Not breathing / gasping', urgency: 'critical', emoji: '😰' },
  { id: 's2', label: 'Convulsion / fitting', urgency: 'critical', emoji: '🧠' },
  { id: 's3', label: 'Unconscious / unresponsive', urgency: 'critical', emoji: '😵' },
  { id: 's4', label: 'Severe difficulty breathing', urgency: 'critical', emoji: '😮‍💨' },
  { id: 's5', label: 'Skin turning blue or grey', urgency: 'critical', emoji: '💙' },
  { id: 's6', label: 'High fever + stiff neck', urgency: 'critical', emoji: '🌡️' },
  { id: 's7', label: 'Severe dehydration (sunken eyes, no tears)', urgency: 'urgent', emoji: '😢' },
  { id: 's8', label: 'High fever (>39°C) for >24h', urgency: 'urgent', emoji: '🔥' },
  { id: 's9', label: 'Not feeding for >8 hours (newborn)', urgency: 'urgent', emoji: '🍼' },
  { id: 's10', label: 'Persistent vomiting + diarrhoea', urgency: 'urgent', emoji: '🤒' },
  { id: 's11', label: 'Rash spreading rapidly', urgency: 'urgent', emoji: '🔴' },
  { id: 's12', label: 'Swollen belly, rigid abdomen', urgency: 'urgent', emoji: '🫃' },
  { id: 's13', label: 'Mild fever (<38.5°C) for 1–2 days', urgency: 'moderate', emoji: '🌡️' },
  { id: 's14', label: 'Cough and cold (mild)', urgency: 'moderate', emoji: '🤧' },
  { id: 's15', label: 'Mild diarrhoea (no blood, alert child)', urgency: 'moderate', emoji: '💧' },
  { id: 's16', label: 'Eye discharge, pink eye', urgency: 'moderate', emoji: '👁️' },
];

const URGENCY_META: Record<Urgency, { label: string; color: string; bg: string; border: string; advice: string; facilities: Facility[] }> = {
  critical: {
    label: '🚨 CRITICAL — Go to Hospital Immediately',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    advice: 'Call 999 (national emergency) or go directly to the nearest District Hospital or tertiary centre. Do not wait. Do not drive if possible — call for an ambulance.',
    facilities: [
      { name: 'Dhaka Shishu Hospital', type: 'Specialised Paediatric Hospital', distance: 'Central Dhaka', phone: '02-9670100', note: 'Most equipped paediatric facility in Bangladesh' },
      { name: 'District Hospital', type: 'District-level Emergency', distance: 'Your district HQ', phone: 'Ask upazila for number', note: 'Emergency department available 24/7' },
      { name: 'National Emergency', type: 'Ambulance & Emergency', distance: 'Anywhere', phone: '999', note: 'Free ambulance service' },
      { name: 'Health Helpline', type: '16000 — National Hotline', distance: 'Phone call', phone: '16000', note: 'Free, 24/7 medical advice' },
    ],
  },
  urgent: {
    label: '⚠️ URGENT — Visit Upazila Health Complex Today',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
    advice: 'Visit your Upazila Health Complex (UHC) within a few hours. If the UHC is closed, go to the nearest District Hospital emergency. Keep the child hydrated.',
    facilities: [
      { name: 'Upazila Health Complex', type: 'Upazila-level Hospital', distance: 'Your upazila', note: '31-bed inpatient facility with doctor' },
      { name: 'Union Health & Family Welfare Centre', type: 'Sub-district Clinic', distance: 'Your union', note: 'Available during working hours' },
      { name: 'DGHS Hotline', type: '16000', distance: 'Phone call', phone: '16000', note: 'National health advice line' },
    ],
  },
  moderate: {
    label: '✅ MODERATE — Visit Community Clinic',
    color: '#0A0A0A',
    bg: '#F5F5F5',
    border: '#D4D4D4',
    advice: 'Visit your nearest Community Clinic or Community Health Centre during working hours (9am–3pm). No emergency action needed — monitor and keep the child comfortable.',
    facilities: [
      { name: 'Community Clinic', type: 'Primary Health Care', distance: 'Your ward/village', note: 'Free primary care, open 6 days/week' },
      { name: 'Union Health & Family Welfare Centre', type: 'Union-level Clinic', distance: 'Your union', note: 'Family planning and primary care' },
      { name: 'Pharmacist Advice', type: 'Local Pharmacy (Apothek)', distance: 'Your neighbourhood', note: 'Ask for ORS sachets and paracetamol suspension' },
    ],
  },
};

export default function EmergencyScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<Urgency | null>(null);

  const toggle = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    setResult(null);
  };

  const classify = () => {
    const picked = SYMPTOMS.filter(s => selected.has(s.id));
    if (picked.some(s => s.urgency === 'critical')) { setResult('critical'); return; }
    if (picked.some(s => s.urgency === 'urgent')) { setResult('urgent'); return; }
    if (picked.length > 0) { setResult('moderate'); return; }
    Alert.alert('No symptoms selected', 'Please select at least one symptom to classify urgency.');
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Cannot open dialler'));
  };

  const meta = result ? URGENCY_META[result] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Emergency Routing</Text>
          <Text style={{ fontSize: 12, color: '#737373' }}>Select symptoms to find the right facility</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        {/* Result banner */}
        {meta && (
          <Animated.View entering={FadeInDown.duration(400)} style={{ backgroundColor: meta.bg, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1.5, borderColor: meta.border }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: meta.color, marginBottom: 8 }}>{meta.label}</Text>
            <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 14 }}>{meta.advice}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A', marginBottom: 8 }}>Recommended Facilities</Text>
            {meta.facilities.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, marginBottom: 8 }}>
                <MapPin size={16} color={meta.color} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A' }}>{f.name}</Text>
                  <Text style={{ fontSize: 12, color: '#737373' }}>{f.type} · {f.distance}</Text>
                  {f.note && <Text style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{f.note}</Text>}
                </View>
                {f.phone && (
                  <Pressable onPress={() => callPhone(f.phone!)} style={{ backgroundColor: meta.color, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} color="white" />
                    <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>{f.phone}</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A', marginBottom: 4 }}>Select symptoms your child has</Text>
        <Text style={{ fontSize: 12, color: '#A3A3A3', marginBottom: 14 }}>Tap all that apply, then press "Find Facility".</Text>

        {(['critical', 'urgent', 'moderate'] as Urgency[]).map(tier => {
          const tierMeta = URGENCY_META[tier];
          const tierSymptoms = SYMPTOMS.filter(s => s.urgency === tier);
          return (
            <View key={tier} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={13} color={tierMeta.color} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: tierMeta.color, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                  {tier === 'critical' ? 'Critical' : tier === 'urgent' ? 'Urgent' : 'Mild'}
                </Text>
              </View>
              {tierSymptoms.map((s, i) => {
                const isOn = selected.has(s.id);
                return (
                  <Animated.View key={s.id} entering={FadeInDown.duration(300).delay(i * 40)}>
                    <Pressable
                      onPress={() => toggle(s.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 6, borderRadius: 13, borderWidth: 1.5, borderColor: isOn ? tierMeta.color : '#E5E5E5', backgroundColor: isOn ? tierMeta.bg : '#FAFAFA' }}>
                      <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                      <Text style={{ flex: 1, fontSize: 14, color: '#0A0A0A' }}>{s.label}</Text>
                      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: isOn ? tierMeta.color : '#D4D4D4', backgroundColor: isOn ? tierMeta.color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        {isOn && <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>✓</Text>}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          );
        })}

        <Pressable
          onPress={classify}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Find the Right Facility →</Text>
        </Pressable>

        <View style={{ backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626', marginBottom: 4 }}>IMPORTANT DISCLAIMER</Text>
          <Text style={{ fontSize: 12, color: '#374151', lineHeight: 19 }}>This tool provides general guidance only. It does not replace clinical assessment. For any life-threatening emergency, call 999 immediately.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
