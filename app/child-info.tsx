import { Text } from '@/components/ui/text';
import { saveChild, validateDob } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Baby, Calendar, Check, Ruler, Scale, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const GENDERS = [
  { value: 'male' as const,   label: 'Male',   icon: '♂' },
  { value: 'female' as const, label: 'Female', icon: '♀' },
  { value: 'other' as const,  label: 'Other',  icon: '○' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#737373', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
      {children}
    </View>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[{ height: 52, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 14, paddingHorizontal: 16, fontSize: 15, backgroundColor: '#FAFAFA', color: '#0A0A0A' }, props.style]}
      placeholderTextColor="#A3A3A3"
    />
  );
}

export default function ChildInfoScreen() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dobError = dob.length === 10 ? validateDob(dob) : null;
  const canSubmit = name.trim() && dob.length === 10 && !dobError && gender;

  const handleSave = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const dobDate = new Date(dob);
      const now = new Date();
      const isPrenatal = dobDate > now;
      await saveChild({
        name: name.trim(),
        dob,
        gender: gender!,
        weightKg: weight ? parseFloat(weight) : 0,
        heightCm: height ? parseFloat(height) : 0,
        journeyType: isPrenatal ? 'prenatal' : 'postnatal',
      });
      router.replace('/(tabs)/home');
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>Child Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Baby color="white" size={28} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Tell us about your child</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19 }}>We use this to personalise care guides, nutrition, games and health reports.</Text>
          </View>
        </Animated.View>

        {/* Age gate notice */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ backgroundColor: '#FFF7ED', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#FED7AA', flexDirection: 'row', gap: 10 }}>
          <Calendar color="#D97706" size={16} style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 }}>
            Supported age range: <Text style={{ fontWeight: '700' }}>−9 months (prenatal)</Text> to <Text style={{ fontWeight: '700' }}>5 years</Text> after birth.
          </Text>
        </Animated.View>

        {error && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ color: '#B91C1C', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        {/* Name */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Field label="Child's Name">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <User size={16} color="#A3A3A3" />
              </View>
              <StyledInput placeholder="e.g. Aayan" value={name} onChangeText={setName} style={{ paddingLeft: 44 }} />
            </View>
          </Field>
        </Animated.View>

        {/* Date of birth */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Field label="Date of Birth (YYYY-MM-DD)">
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                <Calendar size={16} color="#A3A3A3" />
              </View>
              <StyledInput
                placeholder="2025-10-09"
                value={dob}
                onChangeText={t => setDob(t.replace(/[^0-9-]/g, ''))}
                keyboardType="numeric"
                maxLength={10}
                style={{ paddingLeft: 44, borderColor: dobError ? '#FECACA' : '#E5E5E5' }}
              />
            </View>
            {dobError && <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 5 }}>{dobError}</Text>}
            <Text style={{ color: '#A3A3A3', fontSize: 11, marginTop: 5 }}>Enter future date for prenatal (e.g. expected due date)</Text>
          </Field>
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <Field label="Gender">
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {GENDERS.map(g => (
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

        {/* Weight & Height */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="Weight (kg)">
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                    <Scale size={15} color="#A3A3A3" />
                  </View>
                  <StyledInput placeholder="8.2" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={{ paddingLeft: 42 }} />
                </View>
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Height (cm)">
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 14, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 }}>
                    <Ruler size={15} color="#A3A3A3" />
                  </View>
                  <StyledInput placeholder="68.0" value={height} onChangeText={setHeight} keyboardType="decimal-pad" style={{ paddingLeft: 42 }} />
                </View>
              </Field>
            </View>
          </View>
        </Animated.View>

        <Text style={{ color: '#A3A3A3', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>Weight and height are optional but improve risk predictions.</Text>

        {/* Save CTA */}
        <Pressable
          onPress={handleSave}
          disabled={!canSubmit || loading}
          style={{
            height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
            backgroundColor: canSubmit ? '#0A0A0A' : '#E5E5E5',
          }}>
          {loading ? <ActivityIndicator color="#fff" /> : <>
            <Check size={18} color={canSubmit ? '#FFFFFF' : '#A3A3A3'} />
            <Text style={{ color: canSubmit ? '#FFFFFF' : '#A3A3A3', fontSize: 16, fontWeight: '700' }}>Save & Continue</Text>
          </>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
