import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import { ChevronLeft, Moon, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SleepType = 'nap' | 'night' | 'rest';
type SleepQuality = 'good' | 'fair' | 'poor';

interface SleepSession {
  id: number;
  startedAt: string;
  endedAt?: string | null;
  type: SleepType;
  quality?: SleepQuality | null;
  location?: string | null;
  notes?: string | null;
  durationLabel?: string | null;
}

const TYPE_META: Record<SleepType, { label: string; color: string; bg: string }> = {
  nap:   { label: 'Nap',        color: '#7C3AED', bg: '#F5F3FF' },
  night: { label: 'Night',      color: '#4338CA', bg: '#EEF2FF' },
  rest:  { label: 'Rest/Quiet', color: '#6B7280', bg: '#F3F4F6' },
};

const QUALITY_META: Record<SleepQuality, { label: string; color: string }> = {
  good: { label: 'Good',  color: '#10B981' },
  fair: { label: 'Fair',  color: '#F59E0B' },
  poor: { label: 'Poor',  color: '#EF4444' },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SessionCard({ session }: { session: SleepSession }) {
  const meta = TYPE_META[session.type] ?? TYPE_META.nap;
  const quality = session.quality ? QUALITY_META[session.quality] : null;

  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, gap: 12,
      }}>
      <View
        style={{
          width: 42, height: 42, borderRadius: 14,
          backgroundColor: meta.bg, alignItems: 'center', justifyContent: 'center',
        }}>
        <Moon color={meta.color} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
          {meta.label}
          {session.location ? ` · ${session.location}` : ''}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {formatTime(session.startedAt)}
          {session.endedAt ? ` – ${formatTime(session.endedAt)}` : ' · ongoing'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {session.durationLabel && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: meta.bg }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: meta.color }}>
              {session.durationLabel}
            </Text>
          </View>
        )}
        {quality && (
          <Text style={{ fontSize: 11, color: quality.color, fontWeight: '600' }}>
            {quality.label}
          </Text>
        )}
      </View>
    </View>
  );
}

function totalSleepLabel(minutes: number) {
  if (minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function SleepLogScreen() {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: 'nap' as SleepType,
    quality: '' as SleepQuality | '',
    location: '',
    startHour: String(new Date().getHours()),
    startMin: String(new Date().getMinutes()),
    endHour: '',
    endMin: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await sendRequest('/api/sleep/sessions');
      setSessions(res.sessions ?? []);
      setTotalMinutes(res.totalMinutes ?? 0);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function buildDateTime(h: string, m: string) {
    const d = new Date();
    d.setHours(parseInt(h) || 0, parseInt(m) || 0, 0, 0);
    return d.toISOString();
  }

  async function submit() {
    if (!form.startHour) { setError('Start time is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        startedAt: buildDateTime(form.startHour, form.startMin),
        type: form.type,
      };
      if (form.quality) body.quality = form.quality;
      if (form.location.trim()) body.location = form.location.trim();
      if (form.endHour) body.endedAt = buildDateTime(form.endHour, form.endMin);
      if (form.notes.trim()) body.notes = form.notes.trim();

      await sendRequest('/api/sleep/sessions', 'POST', body);
      setShowModal(false);
      setForm({
        type: 'nap', quality: '', location: '',
        startHour: String(new Date().getHours()), startMin: String(new Date().getMinutes()),
        endHour: '', endMin: '', notes: '',
      });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft color="#0A0A0A" size={24} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0A0A0A' }}>Sleep Log</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 1 }}>{today}</Text>
        </View>
        <View style={{ alignItems: 'center', backgroundColor: '#F5F3FF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#7C3AED' }}>{totalSleepLabel(totalMinutes)}</Text>
          <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '600', opacity: 0.75 }}>total today</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Session list */}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
              borderWidth: 1, borderColor: '#E5E5E5',
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
            }}>
            {loading && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator color="#7C3AED" />
              </View>
            )}
            {!loading && sessions.length === 0 && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Moon color="#D1D5DB" size={32} />
                <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 14 }}>No sleep logged today</Text>
              </View>
            )}
            {sessions.map((s, idx) => (
              <View key={s.id} style={{ borderBottomWidth: idx < sessions.length - 1 ? 1 : 0, borderBottomColor: '#E5E5E5' }}>
                <SessionCard session={s} />
              </View>
            ))}
            <Pressable
              onPress={() => setShowModal(true)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16, paddingVertical: 14, gap: 12,
                borderTopWidth: sessions.length > 0 ? 1 : 0, borderTopColor: '#E5E5E5',
              }}>
              <View style={{ width: 42, height: 42, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Log sleep</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0A0A0A' }}>Log Sleep</Text>
            <Pressable onPress={submit} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#7C3AED', fontWeight: '700', opacity: submitting ? 0.5 : 1 }}>
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
            {/* Type */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sleep Type</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['nap', 'night', 'rest'] as SleepType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setForm((f) => ({ ...f, type: t }))}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                      backgroundColor: form.type === t ? TYPE_META[t].bg : '#F9FAFB',
                      borderWidth: 2,
                      borderColor: form.type === t ? TYPE_META[t].color : 'transparent',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: form.type === t ? TYPE_META[t].color : '#6B7280' }}>
                      {TYPE_META[t].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Start time */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Start Time</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TextInput
                  value={form.startHour}
                  onChangeText={(v) => setForm((f) => ({ ...f, startHour: v }))}
                  keyboardType="numeric" maxLength={2} placeholder="HH"
                  style={{ flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
                <Text style={{ fontSize: 18, color: '#6B7280' }}>:</Text>
                <TextInput
                  value={form.startMin}
                  onChangeText={(v) => setForm((f) => ({ ...f, startMin: v }))}
                  keyboardType="numeric" maxLength={2} placeholder="MM"
                  style={{ flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
              </View>
            </View>

            {/* End time */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>End Time (optional)</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TextInput
                  value={form.endHour}
                  onChangeText={(v) => setForm((f) => ({ ...f, endHour: v }))}
                  keyboardType="numeric" maxLength={2} placeholder="HH"
                  style={{ flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
                <Text style={{ fontSize: 18, color: '#6B7280' }}>:</Text>
                <TextInput
                  value={form.endMin}
                  onChangeText={(v) => setForm((f) => ({ ...f, endMin: v }))}
                  keyboardType="numeric" maxLength={2} placeholder="MM"
                  style={{ flex: 1, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16, textAlign: 'center' }}
                />
              </View>
            </View>

            {/* Quality */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sleep Quality</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['good', 'fair', 'poor'] as SleepQuality[]).map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => setForm((f) => ({ ...f, quality: f.quality === q ? '' : q }))}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                      backgroundColor: form.quality === q ? '#F5F3FF' : '#F9FAFB',
                      borderWidth: 2,
                      borderColor: form.quality === q ? QUALITY_META[q].color : 'transparent',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: form.quality === q ? QUALITY_META[q].color : '#6B7280' }}>
                      {QUALITY_META[q].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Location */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['crib', 'arms', 'stroller', 'bed', 'other'].map((loc) => (
                  <Pressable
                    key={loc}
                    onPress={() => setForm((f) => ({ ...f, location: f.location === loc ? '' : loc }))}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                      backgroundColor: form.location === loc ? '#7C3AED' : '#F3F4F6',
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: form.location === loc ? '#FFFFFF' : '#6B7280', textTransform: 'capitalize' }}>
                      {loc}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Text>
              <TextInput
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder="Any observations…"
                multiline numberOfLines={3}
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {error ? <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>{error}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
