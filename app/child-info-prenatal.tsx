import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { saveChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Heart, Plus, Scale, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENDERS = [
  { value: 'male' as const, label: 'Male', icon: '♂' },
  { value: 'female' as const, label: 'Female', icon: '♀' },
  { value: 'unknown' as const, label: 'Unknown', icon: '?' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#737373', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[
        { height: 52, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, paddingHorizontal: 16, fontSize: 15, backgroundColor: '#FAFAFA', color: '#0A0A0A' },
        props.style,
      ]}
      placeholderTextColor="#A3A3A3"
    />
  );
}

type Condition = { name: string };

function validateEdd(val: string): string | null {
  const d = new Date(val);
  const now = new Date();
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 10, now.getDate());
  if (isNaN(d.getTime())) return 'Invalid date format.';
  if (d <= now) return 'Expected delivery date must be in the future.';
  if (d > maxDate) return 'Expected delivery date cannot be more than 10 months away.';
  return null;
}

export default function ChildInfoPrenatalScreen() {
  const [nickname, setNickname] = useState('');
  const [edd, setEdd] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown' | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [motherWeight, setMotherWeight] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eddError = edd.length === 10 ? validateEdd(edd) : null;
  const canSubmit = !!nickname.trim() && edd.length === 10 && !eddError && !!gender && !loading;

  function addCondition() {
    const name = conditionInput.trim();
    if (!name) return;
    setConditions((prev) => [...prev, { name }]);
    setConditionInput('');
  }

  const handleSave = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await sendRequest('/api/onboarding/prenatal', 'POST', {
        babyNickname: nickname.trim(),
        expectedDeliveryDate: edd,
        gender: gender!,
        pregnancyDuration: pregnancyWeeks ? parseInt(pregnancyWeeks) : undefined,
        weight: motherWeight ? parseFloat(motherWeight) : undefined,
        healthConditions: conditions.length > 0 ? conditions : undefined,
      } as any);
      await saveChild({
        name: nickname.trim(),
        dob: edd,
        gender: gender === 'unknown' ? 'other' : gender!,
        weightKg: 0,
        heightCm: 0,
        journeyType: 'prenatal',
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>Prenatal Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero banner */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(50)}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Heart color="white" size={28} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Tell us about your pregnancy</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19 }}>
              We'll personalise prenatal tips and track your baby's development week by week.
            </Text>
          </View>
        </Animated.View>

        {/* Notice */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#BFDBFE', flexDirection: 'row', gap: 10 }}>
          <Calendar color="#2563EB" size={16} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 19 }}>
            Enter your <Text style={{ fontWeight: '700' }}>expected delivery date</Text>. We'll count down week by week and adjust your care guide accordingly.
          </Text>
        </Animated.View>

        {error && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ color: '#B91C1C', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {/* Baby Nickname */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Field label="Baby's Nickname *">
            <StyledInput placeholder="e.g. Little Star" value={nickname} onChangeText={setNickname} />
          </Field>
        </Animated.View>

        {/* Expected Delivery Date */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Field label="Expected Delivery Date (YYYY-MM-DD) *">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <Calendar size={16} color="#A3A3A3" />
              </View>
              <StyledInput
                placeholder="2026-09-20"
                value={edd}
                onChangeText={(t) => setEdd(t.replace(/[^0-9-]/g, ''))}
                keyboardType="numeric"
                maxLength={10}
                style={{ paddingLeft: 44, borderColor: eddError ? '#FECACA' : '#E5E5E5' }}
              />
            </View>
            {eddError && <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 5 }}>{eddError}</Text>}
          </Field>
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <Field label="Baby's Gender *">
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g.value}
                  onPress={() => setGender(g.value)}
                  style={{
                    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5,
                    borderColor: gender === g.value ? '#0A0A0A' : '#E5E5E5',
                    backgroundColor: gender === g.value ? '#0A0A0A' : '#FAFAFA',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                  <Text style={{ fontSize: 16 }}>{g.icon}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: gender === g.value ? '#FFFFFF' : '#737373' }}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
        </Animated.View>

        {/* Current Pregnancy Week */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Field label="Current Pregnancy Week (optional)">
            <StyledInput
              placeholder="e.g. 20"
              value={pregnancyWeeks}
              onChangeText={(t) => setPregnancyWeeks(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={{ color: '#A3A3A3', fontSize: 11, marginTop: 5 }}>Weeks 1–45</Text>
          </Field>
        </Animated.View>

        {/* Mother's Weight */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <Field label="Mother's Weight (kg, optional)">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <Scale size={15} color="#A3A3A3" />
              </View>
              <StyledInput
                placeholder="65.0"
                value={motherWeight}
                onChangeText={setMotherWeight}
                keyboardType="decimal-pad"
                style={{ paddingLeft: 42 }}
              />
            </View>
          </Field>
        </Animated.View>

        {/* Health Conditions chips */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Field label="Mother's Health Conditions (optional)">
            {conditions.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {conditions.map((c, i) => (
                  <View
                    key={i}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 999, paddingVertical: 6, paddingLeft: 12, paddingRight: 8, gap: 6 }}>
                    <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>{c.name}</Text>
                    <Pressable onPress={() => setConditions((prev) => prev.filter((_, idx) => idx !== i))} hitSlop={8}>
                      <X size={13} color="#737373" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StyledInput
                placeholder="e.g. Gestational diabetes"
                value={conditionInput}
                onChangeText={setConditionInput}
                onSubmitEditing={addCondition}
                returnKeyType="done"
                style={{ flex: 1 }}
              />
              <Pressable
                onPress={addCondition}
                style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: conditionInput.trim() ? '#0A0A0A' : '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={18} color={conditionInput.trim() ? '#FFFFFF' : '#A3A3A3'} />
              </Pressable>
            </View>
          </Field>
        </Animated.View>

        {/* CTA */}
        <Pressable
          onPress={handleSave}
          disabled={!canSubmit}
          style={{
            height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8,
            backgroundColor: canSubmit ? '#0A0A0A' : '#E5E5E5',
          }}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: canSubmit ? '#FFFFFF' : '#A3A3A3', fontSize: 16, fontWeight: '700' }}>
              Start Prenatal Journey
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
