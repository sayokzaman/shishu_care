import { Text } from '@/components/ui/text';
import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Baby, BookOpen, Heart, Moon, Sun, Utensils } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AgeBracket = 'prenatal' | '0-1m' | '1-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';

interface GuideSection { icon: any; title: string; tips: string[]; color: string; bg: string; }

const GUIDES: Record<AgeBracket, { headline: string; sections: GuideSection[] }> = {
  prenatal: {
    headline: 'Prenatal Care — Preparing for Your Baby',
    sections: [
      { icon: Heart, title: 'Nutrition for Mum', color: '#D97706', bg: '#FFF7ED', tips: ['Take folic acid 400µg daily to prevent neural tube defects.', 'Eat iron-rich foods: spinach, lentils (dal), liver.', 'Drink 8–10 glasses of water per day.', 'Avoid raw fish, unpasteurised dairy and excess tea/coffee.'] },
      { icon: Sun, title: 'Antenatal Visits', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Attend at least 4 ANC visits at your nearest community clinic or upazila health complex.', 'Get TT (tetanus toxoid) injections as scheduled.', 'Measure blood pressure and check for swelling at every visit.'] },
      { icon: Moon, title: 'Rest & Mental Health', color: '#4F46E5', bg: '#EEF2FF', tips: ['Sleep 8–9 hours; use a pillow to support the belly in the third trimester.', 'Light walking is beneficial — 20 minutes daily.', 'Speak to a health worker if you feel anxious or sad for more than two weeks.'] },
      { icon: Baby, title: 'Birth Preparedness', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Identify the nearest facility with skilled birth attendance.', 'Keep emergency transport and money ready.', 'Pack a delivery bag: clothes, ID, health card, sanitary supplies.'] },
    ],
  },
  '0-1m': {
    headline: 'Newborn Care — First 28 Days',
    sections: [
      { icon: Utensils, title: 'Feeding', color: '#D97706', bg: '#FFF7ED', tips: ['Start breastfeeding within 1 hour of birth.', 'Feed on demand — 8–12 times in 24 hours.', 'Give colostrum (the first yellow milk) — it protects against infections.', 'No water, formula, or honey before 6 months.'] },
      { icon: Heart, title: 'Warmth & Skin Care', color: '#DC2626', bg: '#FEF2F2', tips: ['Keep room temperature 25–28°C.', 'Kangaroo care (skin-to-skin) for 2 hours daily stabilises temperature.', 'Bathe with lukewarm water — until cord falls off, sponge bath only.', 'Clean cord stump with clean water and keep dry.'] },
      { icon: Baby, title: 'Sleep & Position', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Always put baby on their back to sleep (reduces SIDS risk).', 'Share a room but not a bed.', 'Newborns sleep 14–17 hours in 24 hours — this is normal.'] },
      { icon: Sun, title: 'Warning Signs — Seek Care Immediately', color: '#B91C1C', bg: '#FEF2F2', tips: ['Breathing faster than 60 breaths/min or grunting.', 'Skin colour yellow in first 24 hours or whole body.', 'Not feeding after 8 hours.', 'Temperature below 35.5°C or above 38°C.'] },
    ],
  },
  '1-6m': {
    headline: 'Early Infancy — 1 to 6 Months',
    sections: [
      { icon: Utensils, title: 'Feeding', color: '#D97706', bg: '#FFF7ED', tips: ['Continue exclusive breastfeeding — no solids until 6 months.', 'Feed every 2–3 hours during the day; let baby guide night feeds.', 'Increase fluid intake in hot weather (more breastfeeds, not water).'] },
      { icon: Heart, title: 'Development & Play', color: '#4F46E5', bg: '#EEF2FF', tips: ['Talk, sing and read to your baby — language starts here.', 'Tummy time for 3–5 minutes, 3 times daily, to build neck muscles.', 'By 3 months, baby should track moving objects with eyes.', 'Respond to cries promptly — you cannot spoil a baby under 6 months.'] },
      { icon: Moon, title: 'Sleep', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Aim for a loose routine: feed, play, sleep.', 'Total sleep: 14–16 hours; night sleep lengthens gradually.', 'Avoid screens near baby — no TV within 2 metres.'] },
      { icon: Sun, title: 'Vaccinations Due', color: '#0A0A0A', bg: '#F5F5F5', tips: ['BCG and OPV0 at birth (if not already given).', 'PCV, OPV1, Pentavalent 1 at 6 weeks.', 'PCV, OPV2, Pentavalent 2 at 10 weeks.', 'PCV, OPV3, Pentavalent 3, IPV at 14 weeks.'] },
    ],
  },
  '6-12m': {
    headline: 'Complementary Feeding — 6 to 12 Months',
    sections: [
      { icon: Utensils, title: 'Starting Solids', color: '#D97706', bg: '#FFF7ED', tips: ['Start with smooth mashed khichuri, rice, or banana at 6 months.', 'Introduce one new food every 3 days to check for allergies.', 'Offer 2–3 meals + 1–2 snacks daily by 8 months.', 'Continue breastfeeding alongside solids until 2 years.'] },
      { icon: Heart, title: 'Motor & Social Skills', color: '#4F46E5', bg: '#EEF2FF', tips: ['Support sitting — most babies sit unsupported by 7–8 months.', 'Provide safe objects to grasp: spoons, cups, soft blocks.', 'By 9 months, baby should crawl or shuffle.', 'Play peek-a-boo and name body parts.'] },
      { icon: Baby, title: 'Safety', color: '#DC2626', bg: '#FEF2F2', tips: ['Baby-proof floor level: cover sockets, secure hot water, remove small objects.', 'Never leave baby alone on a high surface.', 'Do not give honey, whole nuts, raw carrot, or whole grapes.'] },
      { icon: Sun, title: 'Vaccinations Due', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Measles-Rubella 1 (MR1) at 9 months.'] },
    ],
  },
  '1-2y': {
    headline: 'Active Toddler — 1 to 2 Years',
    sections: [
      { icon: Utensils, title: 'Nutrition', color: '#D97706', bg: '#FFF7ED', tips: ['3 main meals + 2 healthy snacks daily.', 'Offer family foods: rice, dal, vegetables, egg, fish, small amounts of chicken.', 'Encourage self-feeding with a spoon — messy is fine.', 'Continue breastfeeding until 2 years.'] },
      { icon: Heart, title: 'Development', color: '#4F46E5', bg: '#EEF2FF', tips: ['By 12 months: first words, pulls to stand.', 'By 18 months: 10+ words, walks independently.', 'By 2 years: 2-word phrases, runs, climbs stairs with help.', 'Read picture books daily; name everything you see.'] },
      { icon: Moon, title: 'Routine & Behaviour', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Consistent sleep time (8–10 hours night + 1–2 hour nap).', 'Tantrums are normal — stay calm, name the feeling.', 'Screen time: zero before 18 months; max 1 hour/day after.'] },
      { icon: Sun, title: 'Vaccinations Due', color: '#0A0A0A', bg: '#F5F5F5', tips: ['MR2 and JE (Japanese Encephalitis) at 15 months.'] },
    ],
  },
  '2-3y': {
    headline: 'Curious Explorer — 2 to 3 Years',
    sections: [
      { icon: Utensils, title: 'Nutrition', color: '#D97706', bg: '#FFF7ED', tips: ['Offer variety: 5 food groups daily.', 'Iron and zinc from lentils, dark leafy greens, meat, eggs.', 'Healthy Bangladeshi snacks: muri (puffed rice), banana, boiled egg.', 'Limit biscuits, chips, sweetened drinks.'] },
      { icon: Heart, title: 'Language & Social', color: '#4F46E5', bg: '#EEF2FF', tips: ['By 3 years: 200+ words, 3-word sentences.', 'Bilingual is fine — both Bangla and English.', 'Play with other children: sharing, turn-taking.', 'If not yet using 2-word phrases by 2 years, consult a health worker.'] },
      { icon: Baby, title: 'Toilet Training', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Most ready between 18 months–3 years.', 'Look for signs: waking dry, interest in toilet.', 'Praise success; never shame accidents.'] },
      { icon: Sun, title: 'Physical Activity', color: '#0A0A0A', bg: '#F5F5F5', tips: ['At least 3 hours of active play across the day.', 'Outdoor play supports vitamin D production.', 'Avoid long periods in strollers or chairs.'] },
    ],
  },
  '3-5y': {
    headline: 'Preschool Years — 3 to 5 Years',
    sections: [
      { icon: Utensils, title: 'Nutrition', color: '#D97706', bg: '#FFF7ED', tips: ['3 meals + 2 snacks; involve child in choosing vegetables.', 'Vitamin A supplementation every 6 months from national campaign.', 'Ensure adequate protein: eggs, fish, dal, chicken.', 'Limit fast food, processed snacks and sweetened drinks.'] },
      { icon: Heart, title: 'School Readiness', color: '#4F46E5', bg: '#EEF2FF', tips: ['Develop pre-literacy: reading together, drawing, naming letters.', 'Counting songs and games build numeracy.', 'Encourage asking questions and curiosity.'] },
      { icon: BookOpen, title: 'Emotional Development', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Name emotions: "You feel angry because...".', 'Positive discipline: redirect rather than punish.', 'Bedtime routine reduces anxiety and improves sleep.'] },
      { icon: Sun, title: 'Health Checks', color: '#0A0A0A', bg: '#F5F5F5', tips: ['Vision and hearing check before starting school.', 'Dental check at age 3 and annually thereafter.', 'Height and weight every 6 months.'] },
    ],
  },
};

export default function CareGuideScreen() {
  const [childName, setChildName] = useState('Your Child');
  const [ageLabel, setAgeLabel] = useState('');
  const [bracket, setBracket] = useState<AgeBracket>('1-6m');

  useEffect(() => {
    loadChild().then(c => {
      if (!c) return;
      setChildName(c.name);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
      setBracket(getAgeBracket(m) as AgeBracket);
    });
  }, []);

  const guide = GUIDES[bracket];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Care Guide</Text>
          {ageLabel ? <Text style={{ fontSize: 12, color: '#737373' }}>{childName} · {ageLabel}</Text> : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Today's Focus</Text>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', lineHeight: 24 }}>{guide.headline}</Text>
        </Animated.View>

        {guide.sections.map((section, i) => (
          <Animated.View key={section.title} entering={FadeInDown.duration(400).delay(100 + i * 80)} style={{ backgroundColor: section.bg, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                <section.icon size={18} color={section.color} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0A0A0A' }}>{section.title}</Text>
            </View>
            {section.tips.map((tip, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: section.color, marginTop: 7 }} />
                <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 21 }}>{tip}</Text>
              </View>
            ))}
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
