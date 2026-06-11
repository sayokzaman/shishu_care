import Header from '@/components/header';
import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { loadChild } from '@/lib/child';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  ChevronRight,
  Droplets,
  Fish,
  Plus,
  Wheat,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ────────────────────────────────────────────────────────────────────

type FeedingMethod =
  | 'breastfed'
  | 'bottle_breast_milk'
  | 'bottle_formula'
  | 'spoon_fed'
  | 'cup_fed'
  | 'self_fed'
  | 'mixed';

type FoodCategory =
  | 'breast_milk'
  | 'formula'
  | 'water'
  | 'juice'
  | 'grains_cereals'
  | 'legumes'
  | 'fish'
  | 'meat_poultry'
  | 'egg'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'mixed_meal'
  | 'commercial_baby_food'
  | 'snack'
  | 'other';

type FoodConsistency = 'liquid' | 'puree' | 'mashed' | 'minced' | 'soft_pieces' | 'regular';

interface FeedingItem {
  id?: number;
  foodNameBn: string;
  foodNameEn?: string;
  category: FoodCategory;
  consistency?: FoodConsistency;
  amountDescription?: string;
  isNewFood: boolean;
  accepted?: boolean;
  reaction?: string;
}

interface FeedingSession {
  id: number;
  fedAt: string;
  method: FeedingMethod;
  breastSide?: 'left' | 'right' | 'both';
  durationMinutes?: number;
  amountMl?: number;
  mood?: string;
  appetite?: string;
  vomitedAfter: boolean;
  choked: boolean;
  allergicReaction: boolean;
  notes?: string;
  items: FeedingItem[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const METHODS: { value: FeedingMethod; label: string; color: string; bg: string }[] = [
  { value: 'breastfed', label: 'Breastfeed', color: '#EC4899', bg: '#FDF2F8' },
  { value: 'bottle_breast_milk', label: 'Bottle (EBM)', color: '#0EA5E9', bg: '#F0F9FF' },
  { value: 'bottle_formula', label: 'Bottle (Formula)', color: '#6366F1', bg: '#EEF2FF' },
  { value: 'spoon_fed', label: 'Spoon Fed', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'cup_fed', label: 'Cup Fed', color: '#10B981', bg: '#ECFDF5' },
  { value: 'self_fed', label: 'Self Fed', color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'mixed', label: 'Mixed', color: '#6B7280', bg: '#F3F4F6' },
];

const BREAST_SIDES = ['left', 'right', 'both'] as const;
const APPETITES = ['easy', 'moderate', 'difficult', 'refused'] as const;
const MOODS = ['happy', 'fussy', 'drowsy', 'crying'] as const;
const SOLID_METHODS: FeedingMethod[] = ['spoon_fed', 'cup_fed', 'self_fed', 'mixed'];

const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'mixed_meal', label: 'Mixed Meal' },
  { value: 'grains_cereals', label: 'Grains/Cereals' },
  { value: 'legumes', label: 'Dal/Legumes' },
  { value: 'fish', label: 'Fish' },
  { value: 'meat_poultry', label: 'Meat/Poultry' },
  { value: 'egg', label: 'Egg' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'commercial_baby_food', label: 'Baby Food' },
  { value: 'snack', label: 'Snack' },
  { value: 'other', label: 'Other' },
];

const CONSISTENCIES: { value: FoodConsistency; label: string }[] = [
  { value: 'liquid', label: 'Liquid' },
  { value: 'puree', label: 'Puree' },
  { value: 'mashed', label: 'Mashed' },
  { value: 'minced', label: 'Minced' },
  { value: 'soft_pieces', label: 'Soft Pieces' },
  { value: 'regular', label: 'Regular' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sessionSummary(s: FeedingSession) {
  if (s.method === 'breastfed') {
    const side = s.breastSide
      ? ` · ${s.breastSide.charAt(0).toUpperCase() + s.breastSide.slice(1)}`
      : '';
    return s.durationMinutes ? `${s.durationMinutes} min${side}` : side.trim() || 'Breastfeed';
  }
  if (s.method === 'bottle_breast_milk' || s.method === 'bottle_formula') {
    return s.amountMl ? `${s.amountMl} ml` : 'Bottle';
  }
  if (s.items.length > 0) {
    return s.items
      .map((i) => i.foodNameBn || i.foodNameEn)
      .filter(Boolean)
      .join(', ');
  }
  return METHODS.find((m) => m.value === s.method)?.label ?? s.method;
}

function methodMeta(method: FeedingMethod) {
  return METHODS.find((m) => m.value === method) ?? METHODS[METHODS.length - 1];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SessionCard({ session, index }: { session: FeedingSession; index: number }) {
  const meta = methodMeta(session.method);
  const hasFlags = session.vomitedAfter || session.choked || session.allergicReaction;

  return (
    <ScrollView>
      <Animated.View entering={FadeInRight.duration(340).delay(index * 55)}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F0F0',
          }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: meta.bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            }}>
            <Droplets color={meta.color} size={18} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{meta.label}</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 17 }} numberOfLines={2}>
              {sessionSummary(session)}
            </Text>
            {session.items.length > 0 && (
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                {session.items.length} food item{session.items.length > 1 ? 's' : ''}
              </Text>
            )}
            {hasFlags && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <AlertTriangle size={11} color="#DC2626" />
                <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600' }}>
                  {[
                    session.vomitedAfter && 'vomited',
                    session.choked && 'choked',
                    session.allergicReaction && 'reaction',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: meta.bg,
              alignSelf: 'flex-start',
            }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: meta.color }}>
              {formatTime(session.fedAt)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function Chip<T extends string>({
  value,
  selected,
  label,
  color,
  bg,
  onPress,
}: {
  value: T;
  selected: boolean;
  label: string;
  color?: string;
  bg?: string;
  onPress: (v: T) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: selected ? (color ?? '#0A0A0A') : '#E5E5E5',
        backgroundColor: selected ? (bg ?? '#F5F5F5') : '#FAFAFA',
        marginRight: 8,
        marginBottom: 8,
      }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: selected ? '700' : '500',
          color: selected ? (color ?? '#0A0A0A') : '#6B7280',
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Empty food item factory ───────────────────────────────────────────────────

function emptyItem(): Omit<FeedingItem, 'id'> {
  return { foodNameBn: '', category: 'other', isNewFood: false };
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function FeedingLogScreen() {
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [childName, setChildName] = useState('');

  // Form state
  const [method, setMethod] = useState<FeedingMethod>('breastfed');
  const [breastSide, setBreastSide] = useState<'left' | 'right' | 'both' | null>(null);
  const [durationStr, setDurationStr] = useState('');
  const [amountMlStr, setAmountMlStr] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [appetite, setAppetite] = useState<string | null>(null);
  const [vomited, setVomited] = useState(false);
  const [choked, setChoked] = useState(false);
  const [allergic, setAllergic] = useState(false);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<Omit<FeedingItem, 'id'>>>([]);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const loadSessions = useCallback(async () => {
    try {
      const res = await sendRequest('/api/feeding/sessions');
      setSessions(res.sessions ?? []);
    } catch {
      // non-fatal — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChild().then((c) => {
      if (c) setChildName(c.name);
    });
    loadSessions();
  }, [loadSessions]);

  function resetForm() {
    setMethod('breastfed');
    setBreastSide(null);
    setDurationStr('');
    setAmountMlStr('');
    setMood(null);
    setAppetite(null);
    setVomited(false);
    setChoked(false);
    setAllergic(false);
    setNotes('');
    setItems([]);
    setError(null);
  }

  const handleSubmit = async () => {
    setError(null);
    if (SOLID_METHODS.includes(method) && items.length === 0) {
      setError('Please add at least one food item for this feeding method.');
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        fedAt: new Date().toISOString(),
        method,
        mood: mood ?? undefined,
        appetite: appetite ?? undefined,
        vomitedAfter: vomited,
        choked,
        allergicReaction: allergic,
        notes: notes.trim() || undefined,
        items: items.filter((i) => i.foodNameBn.trim()),
      };
      if (method === 'breastfed') {
        body.breastSide = breastSide ?? undefined;
        body.durationMinutes = durationStr ? parseInt(durationStr) : undefined;
      } else if (method === 'bottle_breast_milk' || method === 'bottle_formula') {
        body.amountMl = amountMlStr ? parseFloat(amountMlStr) : undefined;
      }
      await sendRequest('/api/feeding/sessions', 'POST', body);
      setShowForm(false);
      resetForm();
      setLoading(true);
      loadSessions();
    } catch (err: any) {
      setError(err.message ?? 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats for the summary strip
  const breastCount = sessions.filter((s) => s.method === 'breastfed').length;
  const mealCount = sessions.filter((s) => SOLID_METHODS.includes(s.method)).length;
  const bottleCount = sessions.filter(
    (s) => s.method === 'bottle_breast_milk' || s.method === 'bottle_formula'
  ).length;

  return (
    <SafeAreaView style={{ backgroundColor: '#FFFFFF' }} edges={['top']}>
      {/* Header */}
      <Header title="Feeding Log" emoji="🍼" secondaryText={todayLabel}>
        <Pressable
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: '#0F5238',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Plus size={18} color="#FFFFFF" />
        </Pressable>
      </Header>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0A0A0A" />
        </View>
      ) : (
        <ScrollView
          className="h-fit"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Summary strip */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(50)}
            style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 }}>
            {[
              { label: 'Breastfeeds', value: breastCount, color: '#EC4899', bg: '#FDF2F8' },
              { label: 'Meals', value: mealCount, color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Bottles', value: bottleCount, color: '#0EA5E9', bg: '#F0F9FF' },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: stat.bg,
                  borderRadius: 16,
                  padding: 14,
                  alignItems: 'center',
                  gap: 4,
                }}>
                <Text style={{ color: stat.color, fontSize: 22, fontWeight: '900' }}>
                  {stat.value}
                </Text>
                <Text style={{ color: stat.color, fontSize: 11, fontWeight: '600', opacity: 0.8 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Session list */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            className="h-auto"
            style={{
              marginHorizontal: 16,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E5E5E5',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              backgroundColor: '#FFFFFF',
            }}>
            {sessions.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: '#F5F5F5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Baby size={26} color="#D1D5DB" />
                </View>
                <Text
                  style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }}>
                  No feedings logged today.{'\n'}Tap + to add the first one.
                </Text>
              </View>
            ) : (
              sessions.map((s, i) => <SessionCard key={s.id} session={s} index={i} />)
            )}

            {/* Add row */}
            <Pressable
              onPress={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 12,
                borderTopWidth: sessions.length > 0 ? 1 : 0,
                borderTopColor: '#F0F0F0',
              }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#E5E5E5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Plus color="#9CA3AF" size={16} />
              </View>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Log a feeding</Text>
              <ChevronRight size={14} color="#D1D5DB" style={{ marginLeft: 'auto' }} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      )}

      {/* ── Log Form Modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen">
        <SafeAreaView style={{ backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View
              className="h-screen"
              style={{
                backgroundColor: '#FFFFFF',
                bottom: 0,
              }}>
              {/* Modal header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0',
                }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0A0A0A' }}>
                  Log a Feeding
                </Text>
                <Pressable
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#F5F5F5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <X size={16} color="#0A0A0A" />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Method selector */}
                <SectionLabel>Feeding Method</SectionLabel>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                  {METHODS.map((m) => (
                    <Chip
                      key={m.value}
                      value={m.value}
                      selected={method === m.value}
                      label={m.label}
                      color={m.color}
                      bg={m.bg}
                      onPress={setMethod}
                    />
                  ))}
                </View>

                {/* Breastfeeding fields */}
                {method === 'breastfed' && (
                  <View style={{ gap: 14, marginTop: 4 }}>
                    <View>
                      <SectionLabel>Breast Side</SectionLabel>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {BREAST_SIDES.map((s) => (
                          <Pressable
                            key={s}
                            onPress={() => setBreastSide(s as any)}
                            style={{
                              flex: 1,
                              height: 44,
                              borderRadius: 12,
                              borderWidth: 1.5,
                              borderColor: breastSide === s ? '#EC4899' : '#E5E5E5',
                              backgroundColor: breastSide === s ? '#FDF2F8' : '#FAFAFA',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: breastSide === s ? '#EC4899' : '#9CA3AF',
                              }}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                    <View>
                      <SectionLabel>Duration (minutes)</SectionLabel>
                      <StyledInput
                        placeholder="e.g. 15"
                        value={durationStr}
                        onChangeText={setDurationStr}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                )}

                {/* Bottle fields */}
                {(method === 'bottle_breast_milk' || method === 'bottle_formula') && (
                  <View style={{ marginTop: 4 }}>
                    <SectionLabel>Amount (ml)</SectionLabel>
                    <StyledInput
                      placeholder="e.g. 120"
                      value={amountMlStr}
                      onChangeText={setAmountMlStr}
                      keyboardType="decimal-pad"
                    />
                  </View>
                )}

                {/* Solid feeding: food items */}
                {SOLID_METHODS.includes(method) && (
                  <View style={{ marginTop: 4 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}>
                      <SectionLabel noMargin>Food Items</SectionLabel>
                      <Pressable
                        onPress={() => setItems((prev) => [...prev, emptyItem()])}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          backgroundColor: '#F5F5F5',
                          borderRadius: 999,
                        }}>
                        <Plus size={13} color="#0A0A0A" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#0A0A0A' }}>
                          Add food
                        </Text>
                      </Pressable>
                    </View>

                    {items.length === 0 && (
                      <View
                        style={{
                          borderWidth: 2,
                          borderStyle: 'dashed',
                          borderColor: '#E5E5E5',
                          borderRadius: 14,
                          padding: 16,
                          alignItems: 'center',
                          marginBottom: 12,
                        }}>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>
                          No food items added yet.
                        </Text>
                      </View>
                    )}

                    {items.map((item, idx) => (
                      <FoodItemRow
                        key={idx}
                        item={item}
                        onChange={(updated) =>
                          setItems((prev) => prev.map((it, i) => (i === idx ? updated : it)))
                        }
                        onRemove={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      />
                    ))}
                  </View>
                )}

                {/* Child state */}
                <View style={{ marginTop: 16 }}>
                  <SectionLabel>Child's Mood</SectionLabel>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {MOODS.map((m) => (
                      <Chip
                        key={m}
                        value={m}
                        selected={mood === m}
                        label={m.charAt(0).toUpperCase() + m.slice(1)}
                        onPress={(v) => setMood(mood === v ? null : v)}
                      />
                    ))}
                  </View>
                </View>

                <View style={{ marginTop: 8 }}>
                  <SectionLabel>Appetite</SectionLabel>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {APPETITES.map((a) => (
                      <Chip
                        key={a}
                        value={a}
                        selected={appetite === a}
                        label={a.charAt(0).toUpperCase() + a.slice(1)}
                        color={
                          a === 'refused' ? '#DC2626' : a === 'difficult' ? '#F59E0B' : '#10B981'
                        }
                        bg={a === 'refused' ? '#FEF2F2' : a === 'difficult' ? '#FFFBEB' : '#ECFDF5'}
                        onPress={(v) => setAppetite(appetite === v ? null : v)}
                      />
                    ))}
                  </View>
                </View>

                {/* Safety flags */}
                <View style={{ marginTop: 12, gap: 8 }}>
                  <SectionLabel>Safety Flags</SectionLabel>
                  {[
                    { label: 'Vomited after feeding', value: vomited, set: setVomited },
                    { label: 'Choking episode', value: choked, set: setChoked },
                    { label: 'Allergic reaction observed', value: allergic, set: setAllergic },
                  ].map((flag) => (
                    <Pressable
                      key={flag.label}
                      onPress={() => flag.set(!flag.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: flag.value ? '#FECACA' : '#E5E5E5',
                        backgroundColor: flag.value ? '#FEF2F2' : '#FAFAFA',
                      }}>
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: flag.value ? '#DC2626' : '#D1D5DB',
                          backgroundColor: flag.value ? '#DC2626' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {flag.value && (
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>✓</Text>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: flag.value ? '#DC2626' : '#374151',
                          fontWeight: flag.value ? '600' : '400',
                        }}>
                        {flag.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Notes */}
                <View style={{ marginTop: 16 }}>
                  <SectionLabel>Notes (optional)</SectionLabel>
                  <TextInput
                    placeholder="Any observations about this feed..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#A3A3A3"
                    style={{
                      borderWidth: 1,
                      borderColor: '#E5E5E5',
                      borderRadius: 14,
                      padding: 14,
                      fontSize: 14,
                      color: '#0A0A0A',
                      backgroundColor: '#FAFAFA',
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>

                {error && (
                  <View
                    style={{
                      backgroundColor: '#FEF2F2',
                      borderRadius: 12,
                      padding: 12,
                      marginTop: 16,
                      borderWidth: 1,
                      borderColor: '#FECACA',
                    }}>
                    <Text style={{ color: '#B91C1C', fontSize: 13 }}>{error}</Text>
                  </View>
                )}

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  style={{
                    marginTop: 20,
                    height: 54,
                    borderRadius: 16,
                    backgroundColor: submitting ? '#E5E5E5' : '#0F5238',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                      Save Feeding
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Small reusable components ─────────────────────────────────────────────────

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: noMargin ? 0 : 8,
      }}>
      {children}
    </Text>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#A3A3A3"
      style={[
        {
          height: 50,
          borderWidth: 1,
          borderColor: '#E5E5E5',
          borderRadius: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          backgroundColor: '#FAFAFA',
          color: '#0A0A0A',
        },
        props.style,
      ]}
    />
  );
}

function FoodItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: Omit<FeedingItem, 'id'>;
  onChange: (updated: Omit<FeedingItem, 'id'>) => void;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 10,
      }}>
      {/* Name row */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: '#F59E0B20',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Wheat size={14} color="#F59E0B" />
        </View>
        <TextInput
          placeholder="খাবারের নাম (Bangla) *"
          value={item.foodNameBn}
          onChangeText={(v) => onChange({ ...item, foodNameBn: v })}
          placeholderTextColor="#A3A3A3"
          style={{
            flex: 1,
            fontSize: 14,
            color: '#0A0A0A',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E5',
            paddingBottom: 4,
          }}
        />
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#FEF2F2',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <X size={12} color="#DC2626" />
        </Pressable>
      </View>

      {/* English name */}
      <TextInput
        placeholder="Food name in English (optional)"
        value={item.foodNameEn ?? ''}
        onChangeText={(v) => onChange({ ...item, foodNameEn: v || undefined })}
        placeholderTextColor="#A3A3A3"
        style={{
          fontSize: 13,
          color: '#374151',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5E5',
          paddingBottom: 4,
        }}
      />

      {/* Category chips */}
      <View>
        <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 6 }}>
          CATEGORY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}>
          {FOOD_CATEGORIES.map((c) => (
            <Pressable
              key={c.value}
              onPress={() => onChange({ ...item, category: c.value })}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: item.category === c.value ? '#F59E0B' : '#E5E5E5',
                backgroundColor: item.category === c.value ? '#FFFBEB' : '#FFFFFF',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: item.category === c.value ? '700' : '400',
                  color: item.category === c.value ? '#D97706' : '#6B7280',
                }}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Consistency chips */}
      <View>
        <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 6 }}>
          CONSISTENCY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}>
          {CONSISTENCIES.map((c) => (
            <Pressable
              key={c.value}
              onPress={() =>
                onChange({
                  ...item,
                  consistency: item.consistency === c.value ? undefined : c.value,
                })
              }
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: item.consistency === c.value ? '#6366F1' : '#E5E5E5',
                backgroundColor: item.consistency === c.value ? '#EEF2FF' : '#FFFFFF',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: item.consistency === c.value ? '700' : '400',
                  color: item.consistency === c.value ? '#4F46E5' : '#6B7280',
                }}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Amount + new food row */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          placeholder="Amount (e.g. 2 tbsp)"
          value={item.amountDescription ?? ''}
          onChangeText={(v) => onChange({ ...item, amountDescription: v || undefined })}
          placeholderTextColor="#A3A3A3"
          style={{
            flex: 1,
            height: 40,
            fontSize: 13,
            color: '#374151',
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 10,
            paddingHorizontal: 12,
            backgroundColor: '#FFFFFF',
          }}
        />
        <Pressable
          onPress={() => onChange({ ...item, isNewFood: !item.isNewFood })}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: item.isNewFood ? '#10B981' : '#E5E5E5',
            backgroundColor: item.isNewFood ? '#ECFDF5' : '#FFFFFF',
          }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: item.isNewFood ? '#10B981' : '#9CA3AF',
            }}>
            {item.isNewFood ? '🆕 New' : 'New food?'}
          </Text>
        </Pressable>
      </View>

      {/* Accepted toggle */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { label: 'Accepted', value: true as boolean | undefined },
          { label: 'Partial', value: undefined as boolean | undefined },
          { label: 'Refused', value: false as boolean | undefined },
        ].map((opt) => (
          <Pressable
            key={opt.label}
            onPress={() => onChange({ ...item, accepted: opt.value })}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 10,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor:
                item.accepted === opt.value
                  ? opt.value === false
                    ? '#DC2626'
                    : opt.value === true
                      ? '#10B981'
                      : '#6B7280'
                  : '#E5E5E5',
              backgroundColor:
                item.accepted === opt.value
                  ? opt.value === false
                    ? '#FEF2F2'
                    : opt.value === true
                      ? '#ECFDF5'
                      : '#F3F4F6'
                  : '#FFFFFF',
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color:
                  item.accepted === opt.value
                    ? opt.value === false
                      ? '#DC2626'
                      : opt.value === true
                        ? '#10B981'
                        : '#4B5563'
                    : '#9CA3AF',
              }}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
