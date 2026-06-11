import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import { Activity, ChevronLeft, Plus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActivityType = 'tummy_time' | 'play' | 'bath' | 'outdoor' | 'reading' | 'massage' | 'music' | 'other';

interface ActivitySession {
  id: number;
  startedAt: string;
  durationMinutes?: number | null;
  type: ActivityType;
  notes?: string | null;
}

const TYPE_META: Record<ActivityType, { label: string; emoji: string; color: string; bg: string }> = {
  tummy_time: { label: 'Tummy Time', emoji: '🤸', color: '#F59E0B', bg: '#FFFBEB' },
  play:       { label: 'Play',       emoji: '🧸', color: '#0EA5E9', bg: '#F0F9FF' },
  bath:       { label: 'Bath',       emoji: '🛁', color: '#3B82F6', bg: '#EFF6FF' },
  outdoor:    { label: 'Outdoor',    emoji: '🌿', color: '#10B981', bg: '#ECFDF5' },
  reading:    { label: 'Reading',    emoji: '📖', color: '#6366F1', bg: '#EEF2FF' },
  massage:    { label: 'Massage',    emoji: '💆', color: '#EC4899', bg: '#FDF2F8' },
  music:      { label: 'Music',      emoji: '🎵', color: '#8B5CF6', bg: '#F5F3FF' },
  other:      { label: 'Other',      emoji: '⭐', color: '#6B7280', bg: '#F3F4F6' },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SessionCard({ session, isLast }: { session: ActivitySession; isLast: boolean }) {
  const meta = TYPE_META[session.type] ?? TYPE_META.other;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14, gap: 12,
      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#E5E5E5',
    }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: meta.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{meta.label}</Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {formatTime(session.startedAt)}
          {session.notes ? ` · ${session.notes}` : ''}
        </Text>
      </View>
      {session.durationMinutes ? (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: meta.bg }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: meta.color }}>
            {session.durationMinutes}m
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ActivityLogScreen() {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: 'tummy_time' as ActivityType,
    startHour: String(new Date().getHours()),
    startMin: String(new Date().getMinutes()),
    durationMinutes: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await sendRequest('/api/activities/sessions');
      setSessions(res.sessions ?? []);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const d = new Date();
      d.setHours(parseInt(form.startHour) || 0, parseInt(form.startMin) || 0, 0, 0);
      const body: Record<string, unknown> = {
        startedAt: d.toISOString(),
        type: form.type,
      };
      if (form.durationMinutes) body.durationMinutes = parseInt(form.durationMinutes);
      if (form.notes.trim()) body.notes = form.notes.trim();

      await sendRequest('/api/activities/sessions', 'POST', body);
      setShowModal(false);
      setForm({ type: 'tummy_time', startHour: String(new Date().getHours()), startMin: String(new Date().getMinutes()), durationMinutes: '', notes: '' });
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
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0A0A0A' }}>Activity Log</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 1 }}>{today}</Text>
        </View>
        <View style={{ alignItems: 'center', backgroundColor: '#F0F9FF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0EA5E9' }}>{sessions.length}</Text>
          <Text style={{ fontSize: 11, color: '#0EA5E9', fontWeight: '600', opacity: 0.75 }}>today</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
            borderWidth: 1, borderColor: '#E5E5E5',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
          }}>
            {loading && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator color="#0EA5E9" />
              </View>
            )}
            {!loading && sessions.length === 0 && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Activity color="#D1D5DB" size={32} />
                <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 14 }}>No activities logged today</Text>
              </View>
            )}
            {sessions.map((s, idx) => (
              <SessionCard key={s.id} session={s} isLast={idx === sessions.length - 1} />
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
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Log activity</Text>
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
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#0A0A0A' }}>Log Activity</Text>
            <Pressable onPress={submit} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#0EA5E9', fontWeight: '700', opacity: submitting ? 0.5 : 1 }}>
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
            {/* Activity type grid */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Activity Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(Object.keys(TYPE_META) as ActivityType[]).map((t) => {
                  const m = TYPE_META[t];
                  const active = form.type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setForm((f) => ({ ...f, type: t }))}
                      style={{
                        width: '22%', alignItems: 'center', paddingVertical: 10, borderRadius: 14,
                        backgroundColor: active ? m.bg : '#F9FAFB',
                        borderWidth: 2, borderColor: active ? m.color : 'transparent',
                      }}>
                      <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: active ? m.color : '#9CA3AF', marginTop: 4 }}>{m.label}</Text>
                    </Pressable>
                  );
                })}
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

            {/* Duration */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration (minutes)</Text>
              <TextInput
                value={form.durationMinutes}
                onChangeText={(v) => setForm((f) => ({ ...f, durationMinutes: v }))}
                keyboardType="numeric" placeholder="e.g. 15"
                style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 12, fontSize: 16 }}
              />
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
