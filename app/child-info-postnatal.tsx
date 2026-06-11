import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { saveChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Baby, Calendar, Plus, Ruler, Scale, User, X } from 'lucide-react-native';
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

function validateDob(val: string): string | null {
  const d = new Date(val);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  if (isNaN(d.getTime())) return 'Invalid date format.';
  if (d > now) return 'Date of birth cannot be in the future.';
  if (d < minDate) return 'ShishuCare supports children up to 5 years old.';
  return null;
}

export default function ChildInfoPostnatalScreen() {
  const [fullNameBn, setFullNameBn] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown' | null>(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dobError = dob.length === 10 ? validateDob(dob) : null;
  const weightVal = parseFloat(currentWeight);
  const heightVal = parseFloat(currentHeight);
  const canSubmit =
    !!fullNameBn.trim() &&
    dob.length === 10 && !dobError &&
    !!gender &&
    currentWeight.trim() !== '' && !isNaN(weightVal) && weightVal > 0 &&
    currentHeight.trim() !== '' && !isNaN(heightVal) && heightVal > 0 &&
    !loading;

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
      const birthWeightVal = birthWeight ? parseFloat(birthWeight) : undefined;
      const data = await sendRequest('/api/onboarding/postnatal', 'POST', {
        fullNameBn: fullNameBn.trim(),
        fullNameEn: fullNameEn.trim() || undefined,
        dateOfBirth: dob,
        gender: gender!,
        currentWeightKg: weightVal,
        currentHeightCm: heightVal,
        birthWeightKg: birthWeightVal && birthWeightVal > 0 ? birthWeightVal : undefined,
        guardianName: guardianName.trim() || undefined,
        knownConditions: conditions.length > 0 ? conditions : undefined,
      } as any);
      await saveChild({
        id: data?.child?.id,
        name: fullNameBn.trim(),
        dob,
        gender: gender === 'unknown' ? 'other' : gender!,
        weightKg: weightVal,
        heightCm: heightVal,
        journeyType: 'postnatal',
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
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>Child Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero banner */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(50)}
          style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Baby color="white" size={28} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Tell us about your child</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19 }}>
              We use this to personalise care guides, nutrition, games and health reports.
            </Text>
          </View>
        </Animated.View>

        {/* Age gate notice */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={{ backgroundColor: '#FFF7ED', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#FED7AA', flexDirection: 'row', gap: 10 }}>
          <Calendar color="#D97706" size={16} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 }}>
            Supported age range: <Text style={{ fontWeight: '700' }}>newborn</Text> to <Text style={{ fontWeight: '700' }}>5 years</Text>.
          </Text>
        </Animated.View>

        {error && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ color: '#B91C1C', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {/* Name in Bengali */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Field label="Child's Name (Bengali) *">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <User size={16} color="#A3A3A3" />
              </View>
              <StyledInput placeholder="e.g. আয়ান" value={fullNameBn} onChangeText={setFullNameBn} style={{ paddingLeft: 44 }} />
            </View>
          </Field>
        </Animated.View>

        {/* Name in English */}
        <Animated.View entering={FadeInDown.duration(400).delay(170)}>
          <Field label="Child's Name (English, optional)">
            <StyledInput placeholder="e.g. Aayan" value={fullNameEn} onChangeText={setFullNameEn} />
          </Field>
        </Animated.View>

        {/* Date of Birth */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Field label="Date of Birth (YYYY-MM-DD) *">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <Calendar size={16} color="#A3A3A3" />
              </View>
              <StyledInput
                placeholder="2024-06-15"
                value={dob}
                onChangeText={(t) => setDob(t.replace(/[^0-9-]/g, ''))}
                keyboardType="numeric"
                maxLength={10}
                style={{ paddingLeft: 44, borderColor: dobError ? '#FECACA' : '#E5E5E5' }}
              />
            </View>
            {dobError && <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 5 }}>{dobError}</Text>}
          </Field>
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <Field label="Gender *">
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

        {/* Current Weight & Height */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Current Weight (kg) *">
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                    <Scale size={15} color="#A3A3A3" />
                  </View>
                  <StyledInput placeholder="8.5" value={currentWeight} onChangeText={setCurrentWeight} keyboardType="decimal-pad" style={{ paddingLeft: 42 }} />
                </View>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Current Height (cm) *">
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                    <Ruler size={15} color="#A3A3A3" />
                  </View>
                  <StyledInput placeholder="72.0" value={currentHeight} onChangeText={setCurrentHeight} keyboardType="decimal-pad" style={{ paddingLeft: 42 }} />
                </View>
              </Field>
            </View>
          </View>
        </Animated.View>

        {/* Birth Weight */}
        <Animated.View entering={FadeInDown.duration(400).delay(330)}>
          <Field label="Birth Weight (kg, optional)">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <Scale size={15} color="#A3A3A3" />
              </View>
              <StyledInput placeholder="3.2" value={birthWeight} onChangeText={setBirthWeight} keyboardType="decimal-pad" style={{ paddingLeft: 42 }} />
            </View>
            <Text style={{ color: '#A3A3A3', fontSize: 11, marginTop: 5 }}>Used to track growth from birth onwards.</Text>
          </Field>
        </Animated.View>

        {/* Guardian Name */}
        <Animated.View entering={FadeInDown.duration(400).delay(360)}>
          <Field label="Guardian Name (optional)">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <User size={16} color="#A3A3A3" />
              </View>
              <StyledInput placeholder="e.g. Fatima Begum" value={guardianName} onChangeText={setGuardianName} style={{ paddingLeft: 44 }} />
            </View>
          </Field>
        </Animated.View>

        {/* Known Conditions chips */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Field label="Known Health Conditions (optional)">
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
                placeholder="e.g. Jaundice at birth"
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

        <Text style={{ color: '#A3A3A3', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>
          Location defaults to your registered address. You can update it later in your profile.
        </Text>

        {/* CTA */}
        <Pressable
          onPress={handleSave}
          disabled={!canSubmit}
          style={{
            height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
            backgroundColor: canSubmit ? '#0A0A0A' : '#E5E5E5',
          }}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: canSubmit ? '#FFFFFF' : '#A3A3A3', fontSize: 16, fontWeight: '700' }}>
              Start Postnatal Journey
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
