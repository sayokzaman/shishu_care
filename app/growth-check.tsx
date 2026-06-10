import { Text } from '@/components/ui/text';
import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AgeBracket = 'prenatal' | '0-1m' | '1-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';

interface MilestoneItem { id: string; text: string; domain: 'motor' | 'language' | 'social' | 'cognitive' | 'health'; }

const MILESTONES: Record<AgeBracket, { title: string; items: MilestoneItem[] }> = {
  prenatal: {
    title: 'Prenatal Wellbeing Checklist',
    items: [
      { id: 'p1', text: 'Completed at least 1 antenatal care visit', domain: 'health' },
      { id: 'p2', text: 'Received iron and folic acid tablets', domain: 'health' },
      { id: 'p3', text: 'Received TT (tetanus toxoid) vaccination', domain: 'health' },
      { id: 'p4', text: 'Blood pressure checked in current trimester', domain: 'health' },
      { id: 'p5', text: 'Birth plan discussed with health worker', domain: 'health' },
      { id: 'p6', text: 'Emergency transport arranged for delivery', domain: 'health' },
    ],
  },
  '0-1m': {
    title: 'Newborn Milestones (0–4 weeks)',
    items: [
      { id: 'n1', text: 'Breastfed within 1 hour of birth', domain: 'health' },
      { id: 'n2', text: 'Reacts to loud sounds (startle reflex)', domain: 'cognitive' },
      { id: 'n3', text: 'Turns head towards caregiver\'s voice', domain: 'social' },
      { id: 'n4', text: 'Briefly focuses on a face held close (20–30cm)', domain: 'cognitive' },
      { id: 'n5', text: 'BCG and OPV0 vaccines given', domain: 'health' },
      { id: 'n6', text: 'Weight checked at birth and at 2 weeks', domain: 'health' },
    ],
  },
  '1-6m': {
    title: 'Early Infancy Milestones (1–6 months)',
    items: [
      { id: 'i1', text: 'Smiles responsively (by 2 months)', domain: 'social' },
      { id: 'i2', text: 'Holds head briefly during tummy time (by 2 months)', domain: 'motor' },
      { id: 'i3', text: 'Coos and makes sounds (by 3 months)', domain: 'language' },
      { id: 'i4', text: 'Tracks moving objects with eyes (by 3 months)', domain: 'cognitive' },
      { id: 'i5', text: 'Holds a rattle when placed in hand (by 4 months)', domain: 'motor' },
      { id: 'i6', text: 'Laughs and squeals (by 4 months)', domain: 'social' },
      { id: 'i7', text: 'Reaches for nearby objects (by 5 months)', domain: 'motor' },
      { id: 'i8', text: '6-week vaccines complete (Pentavalent, PCV, OPV)', domain: 'health' },
    ],
  },
  '6-12m': {
    title: 'Later Infancy Milestones (6–12 months)',
    items: [
      { id: 'm1', text: 'Sits without support (by 7 months)', domain: 'motor' },
      { id: 'm2', text: 'Babbles (ba-ba, ma-ma sounds) by 8 months', domain: 'language' },
      { id: 'm3', text: 'Stands holding furniture (by 9 months)', domain: 'motor' },
      { id: 'm4', text: 'Shows stranger anxiety (by 9 months)', domain: 'social' },
      { id: 'm5', text: 'Picks up small objects with finger and thumb pincer grip (by 9–10 months)', domain: 'motor' },
      { id: 'm6', text: 'Waves bye-bye or claps hands (by 10 months)', domain: 'social' },
      { id: 'm7', text: 'First words (mama/baba with meaning) by 12 months', domain: 'language' },
      { id: 'm8', text: 'MR1 vaccine given at 9 months', domain: 'health' },
    ],
  },
  '1-2y': {
    title: 'Toddler Milestones (12–24 months)',
    items: [
      { id: 't1', text: 'Walks independently (by 12–15 months)', domain: 'motor' },
      { id: 't2', text: 'Uses 10+ words by 18 months', domain: 'language' },
      { id: 't3', text: 'Points to 2–3 body parts when named (by 18 months)', domain: 'cognitive' },
      { id: 't4', text: 'Feeds self with spoon (by 18 months)', domain: 'motor' },
      { id: 't5', text: 'Imitates household tasks (by 18 months)', domain: 'social' },
      { id: 't6', text: 'Uses 2-word phrases by 24 months ("more milk")', domain: 'language' },
      { id: 't7', text: 'Stacks 3–4 blocks (by 18 months)', domain: 'cognitive' },
      { id: 't8', text: 'MR2 and JE vaccines given', domain: 'health' },
    ],
  },
  '2-3y': {
    title: 'Early Toddler Milestones (2–3 years)',
    items: [
      { id: 'tt1', text: 'Runs and climbs stairs with support', domain: 'motor' },
      { id: 'tt2', text: 'Uses 3-word sentences by 2.5 years', domain: 'language' },
      { id: 'tt3', text: 'Names at least 6 familiar objects', domain: 'language' },
      { id: 'tt4', text: 'Engages in pretend play (feeding a doll)', domain: 'cognitive' },
      { id: 'tt5', text: 'Knows own first name and age', domain: 'cognitive' },
      { id: 'tt6', text: 'Shows interest in other children', domain: 'social' },
      { id: 'tt7', text: 'Draws a vertical line when shown', domain: 'motor' },
    ],
  },
  '3-5y': {
    title: 'Preschool Milestones (3–5 years)',
    items: [
      { id: 'p1', text: 'Hops on one foot for 2 seconds (by 4 years)', domain: 'motor' },
      { id: 'p2', text: 'Speaks in full sentences (4–5 words) by 4 years', domain: 'language' },
      { id: 'p3', text: 'Can copy a circle or cross shape', domain: 'motor' },
      { id: 'p4', text: 'Understands the concept of "same" and "different"', domain: 'cognitive' },
      { id: 'p5', text: 'Can name 4+ colours by 4 years', domain: 'cognitive' },
      { id: 'p6', text: 'Plays cooperatively in group games', domain: 'social' },
      { id: 'p7', text: 'Can dress self with minimal help (by 5 years)', domain: 'motor' },
      { id: 'p8', text: 'Follows 2-step instructions reliably', domain: 'cognitive' },
      { id: 'p9', text: 'Vitamin A supplementation received (national round)', domain: 'health' },
    ],
  },
};

const DOMAIN_META = {
  motor:     { color: '#7C3AED', label: 'Motor' },
  language:  { color: '#2563EB', label: 'Language' },
  social:    { color: '#D97706', label: 'Social' },
  cognitive: { color: '#0A0A0A', label: 'Cognitive' },
  health:    { color: '#DC2626', label: 'Health' },
};

export default function GrowthCheckScreen() {
  const [childName, setChildName] = useState('Your Child');
  const [ageLabel, setAgeLabel] = useState('');
  const [bracket, setBracket] = useState<AgeBracket>('1-6m');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChildName(c.name);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
      setBracket(getAgeBracket(m) as AgeBracket);
    });
  }, []);

  const toggle = (id: string) => setChecked(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const checklist = MILESTONES[bracket];
  const total = checklist.items.length;
  const done = checklist.items.filter(i => checked.has(i.id)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Growth Checklist</Text>
          {ageLabel ? <Text style={{ fontSize: 12, color: '#737373' }}>{childName} · {ageLabel}</Text> : null}
        </View>
        <View style={{ backgroundColor: '#0A0A0A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>{done}/{total}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 12 }}>{checklist.title}</Text>
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${percent}%`, backgroundColor: 'white', borderRadius: 4 }} />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>{percent}% complete · {done} of {total} milestones</Text>
        </Animated.View>

        {/* Domain legend */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {Object.entries(DOMAIN_META).map(([key, val]) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: val.color }} />
              <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>{val.label}</Text>
            </View>
          ))}
        </Animated.View>

        {checklist.items.map((item, i) => {
          const isChecked = checked.has(item.id);
          const domain = DOMAIN_META[item.domain];
          return (
            <Animated.View key={item.id} entering={FadeInDown.duration(400).delay(100 + i * 50)}>
              <Pressable
                onPress={() => toggle(item.id)}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 8, borderRadius: 14, borderWidth: 1.5, borderColor: isChecked ? '#0A0A0A' : '#E5E5E5', backgroundColor: isChecked ? '#F5F5F5' : '#FFFFFF' }}>
                {isChecked
                  ? <CheckCircle size={22} color="#0A0A0A" strokeWidth={2.5} />
                  : <Circle size={22} color="#D4D4D4" strokeWidth={1.5} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: isChecked ? '#737373' : '#0A0A0A', lineHeight: 21, textDecorationLine: isChecked ? 'line-through' : 'none' }}>{item.text}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: domain.color }} />
                    <Text style={{ fontSize: 11, color: domain.color, fontWeight: '600' }}>{domain.label}</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        {done < total && (
          <Animated.View entering={FadeInDown.duration(400).delay(200 + checklist.items.length * 50)} style={{ backgroundColor: '#FFF7ED', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#FED7AA' }}>
            <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 20 }}>
              <Text style={{ fontWeight: '700' }}>Note: </Text>
              If your child has not reached several milestones, speak with a health worker at your nearest Community Clinic or Upazila Health Complex. WHO-based milestones have a range — some variation is normal.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
