import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import { Baby, ChevronLeft, Plus, Ruler, TrendingUp } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GrowthMeasurement {
  id: number;
  measuredAt: string;
  ageDays: number;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number | null;
  notes?: string | null;
}

function ageLabel(ageDays: number) {
  if (ageDays < 7) return `${ageDays}d`;
  if (ageDays < 30) return `${Math.floor(ageDays / 7)}w`;
  const months = Math.floor(ageDays / 30.44);
  if (months < 24) return `${months}m`;
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

function MeasurementRow({ m, isLast }: { m: GrowthMeasurement; isLast: boolean }) {
  const date = new Date(m.measuredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#E5E5E5',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280' }}>{date}</Text>
        <View style={{ marginLeft: 8, backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>{ageLabel(m.ageDays)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 14, padding: 12, alignItems: 'center' }}>
          <Baby color="#0A0A0A" size={16} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 4 }}>
            {m.weightKg > 0 ? `${m.weightKg} kg` : '—'}
          </Text>
          <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Weight</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 14, padding: 12, alignItems: 'center' }}>
          <Ruler color="#3B82F6" size={16} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 4 }}>
            {m.heightCm > 0 ? `${m.heightCm} cm` : '—'}
          </Text>
          <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Height</Text>
        </View>
        {m.headCircumferenceCm ? (
          <View style={{ flex: 1, backgroundColor: '#F5F3FF', borderRadius: 14, padding: 12, alignItems: 'center' }}>
            <TrendingUp color="#7C3AED" size={16} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 4 }}>
              {m.headCircumferenceCm} cm
            </Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Head</Text>
          </View>
        ) : null}
      </View>
      {m.notes ? <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>{m.notes}</Text> : null}
    </View>
  );
}

export default function GrowthLogScreen() {
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [latest, setLatest] = useState<GrowthMeasurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ weightKg: '', heightCm: '', headCircumferenceCm: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [latestRes, listRes] = await Promise.all([
        sendRequest('/api/growth/latest'),
        sendRequest('/api/growth/measurements'),
      ]);
      setLatest(latestRes.measurement ?? null);
      setMeasurements(listRes.measurements ?? []);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!form.weightKg && !form.heightCm && !form.headCircumferenceCm) {
      setError('Enter at least one measurement');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, unknown> = { measuredAt: new Date().toISOString() };
      if (form.weightKg) body.weightKg = parseFloat(form.weightKg);
      if (form.heightCm) body.heightCm = parseFloat(form.heightCm);
      if (form.headCircumferenceCm) body.headCircumferenceCm = parseFloat(form.headCircumferenceCm);
      if (form.notes.trim()) body.notes = form.notes.trim();

      await sendRequest('/api/growth/measurements', 'POST', body);
      setShowModal(false);
      setForm({ weightKg: '', heightCm: '', headCircumferenceCm: '', notes: '' });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft color="#0A0A0A" size={24} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0A0A0A' }}>Growth</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 1 }}>Measurement history</Text>
        </View>
        <Pressable
          onPress={() => setShowModal(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#0A0A0A', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
          }}>
          <Plus color="#FFFFFF" size={16} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Add</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Latest snapshot */}
        {latest && (
          <View style={{ marginHorizontal: 16, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', flex: 1 }}>LATEST</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                {new Date(latest.measuredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Weight', value: latest.weightKg > 0 ? `${latest.weightKg} kg` : '—', Icon: Baby, color: '#0A0A0A', bg: '#F5F5F5' },
                { label: 'Height', value: latest.heightCm > 0 ? `${latest.heightCm} cm` : '—', Icon: Ruler, color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Head', value: latest.headCircumferenceCm ? `${latest.headCircumferenceCm} cm` : '—', Icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF' },
              ].map((m) => {
                const MIcon = m.Icon;
                return (
                  <View key={m.label} style={{
                    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, alignItems: 'center', gap: 6,
                    borderWidth: 1, borderColor: '#E5E5E5',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
                  }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: m.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <MIcon color={m.color} size={16} />
                    </View>
                    <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800' }}>{m.value}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '500' }}>{m.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* History list */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>History</Text>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
            borderWidth: 1, borderColor: '#E5E5E5',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
          }}>
            {loading && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator color="#0A0A0A" />
              </View>
            )}
            {!loading && measurements.length === 0 && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Ruler color="#D1D5DB" size={32} />
                <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 14 }}>No measurements yet</Text>
              </View>
            )}
            {measurements.map((m, idx) => (
              <MeasurementRow key={m.id} m={m} isLast={idx === measurements.length - 1} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Measurement Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0A0A0A' }}>Add Measurement</Text>
            <Pressable onPress={submit} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#0A0A0A', fontWeight: '700', opacity: submitting ? 0.5 : 1 }}>
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Weight (kg)</Text>
              <TextInput
                value={form.weightKg}
                onChangeText={(v) => setForm((f) => ({ ...f, weightKg: v }))}
                keyboardType="decimal-pad" placeholder="e.g. 8.2"
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 16 }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Height (cm)</Text>
              <TextInput
                value={form.heightCm}
                onChangeText={(v) => setForm((f) => ({ ...f, heightCm: v }))}
                keyboardType="decimal-pad" placeholder="e.g. 68"
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 16 }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Head Circumference (cm)</Text>
              <TextInput
                value={form.headCircumferenceCm}
                onChangeText={(v) => setForm((f) => ({ ...f, headCircumferenceCm: v }))}
                keyboardType="decimal-pad" placeholder="e.g. 44"
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 16 }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Text>
              <TextInput
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder="e.g. measured at clinic"
                multiline numberOfLines={2}
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', minHeight: 70, textAlignVertical: 'top' }}
              />
            </View>

            {error ? <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>{error}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
