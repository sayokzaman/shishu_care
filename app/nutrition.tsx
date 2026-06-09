import { Text } from '@/components/ui/text';
import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { router } from 'expo-router';
import { ArrowLeft, Droplets, Fish, Leaf, Wheat } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AgeBracket = 'prenatal' | '0-1m' | '1-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';

interface FoodGroup { name: string; icon: any; iconColor: string; bg: string; items: string[]; note?: string; }
interface MealPlan { headline: string; summary: string; meals: number; frequency: string; groups: FoodGroup[]; avoid: string[]; tip: string; }

const PLANS: Record<AgeBracket, MealPlan> = {
  prenatal: {
    headline: 'Prenatal Nutrition',
    summary: 'Focus on nutrient-dense foods to support foetal brain and body development.',
    meals: 5, frequency: '3 meals + 2 snacks',
    groups: [
      { name: 'Iron & Folate', icon: Leaf, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['Lentils (mashkalai dal)', 'Spinach (palak shak)', 'Liver (once a week)', 'Fortified rice, green leafy vegetables'] },
      { name: 'Protein', icon: Fish, iconColor: '#2563EB', bg: '#EFF6FF', items: ['Eggs (2 per day)', 'Small fish: hilsa, rui, koi', 'Chicken or beef (small portions)', 'Dried lentils (dal) every meal'] },
      { name: 'Calcium', icon: Droplets, iconColor: '#D97706', bg: '#FFF7ED', items: ['Milk (2 glasses/day)', 'Yogurt (doi)', 'Small fish with bones (like shutki)', 'Sesame seeds (til)'] },
      { name: 'Energy Foods', icon: Wheat, iconColor: '#7C3AED', bg: '#F5F3FF', items: ['Rice, bread (roti)', 'Sweet potato (misti alu)', 'Banana', 'Peanuts (a small handful)'] },
    ],
    avoid: ['Excess tea or coffee (reduces iron absorption)', 'Raw/undercooked fish or meat', 'Papaya (raw)', 'Excess salt and pickles'],
    tip: 'Take iron + folic acid tablets daily as given at antenatal visits. Do not skip.',
  },
  '0-1m': {
    headline: 'Newborn — Breastmilk Only',
    summary: 'Breastmilk is the perfect complete food for the first 6 months. No supplements needed except Vitamin D in some cases.',
    meals: 12, frequency: 'Every 1.5–3 hours on demand',
    groups: [
      { name: 'Breastmilk', icon: Droplets, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['Feed on demand — at least 8–12 times per 24 hours', 'Give colostrum (first yellow milk) — rich in antibodies', 'Both breasts at each feed', 'Signs of good feeding: 6+ wet nappies/day, weight gain'] },
    ],
    avoid: ['Water (unnecessary before 6 months and dangerous for newborns)', 'Formula (unless medically indicated)', 'Honey (risk of infant botulism)', 'Any solid or semi-solid food'],
    tip: 'A nursing mother needs an extra 500 calories/day. Eat nutritious local foods and drink enough fluids.',
  },
  '1-6m': {
    headline: 'Exclusive Breastfeeding — 1 to 6 Months',
    summary: 'Continue exclusive breastfeeding. No water, juice or solids until 6 months.',
    meals: 10, frequency: 'Every 2–3 hours',
    groups: [
      { name: 'Breastmilk', icon: Droplets, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['Continue on-demand breastfeeding', 'Night feeding is normal and supports milk supply', 'Express and store if returning to work'] },
    ],
    avoid: ['Water or juice', 'Formula (unless prescribed)', 'Any solid foods before 6 months', 'Herbal preparations'],
    tip: 'Keep the mother well-nourished: extra rice, dal, fish, leafy greens and plenty of fluids.',
  },
  '6-12m': {
    headline: 'Complementary Feeding — 6 to 12 Months',
    summary: 'Introduce solids alongside breastfeeding. Start with soft, mashed single foods.',
    meals: 3, frequency: '2–3 meals + 1–2 snacks',
    groups: [
      { name: 'Staple Grains', icon: Wheat, iconColor: '#7C3AED', bg: '#F5F3FF', items: ['Soft khichuri (rice + dal + vegetables)', 'Mashed plain rice (bhat)', 'Suji (semolina) porridge'] },
      { name: 'Protein', icon: Fish, iconColor: '#2563EB', bg: '#EFF6FF', items: ['Mashed egg yolk (from 6m, whole egg from 8m)', 'Mashed soft fish (rui, tilapia)', 'Well-mashed dal (red lentil, mung dal)'] },
      { name: 'Vegetables & Fruit', icon: Leaf, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['Mashed sweet potato', 'Pureed pumpkin (kumra)', 'Mashed banana, ripe papaya', 'Boiled and mashed carrot'] },
      { name: 'Dairy/Fat', icon: Droplets, iconColor: '#D97706', bg: '#FFF7ED', items: ['Continue breastfeeding', 'A few drops of mustard oil in khichuri adds calories', 'Plain yogurt (doi) from 8 months'] },
    ],
    avoid: ['Honey (under 12 months)', 'Whole cow\'s milk as main drink', 'Salt or sugar added to food', 'Choking hazards: whole grapes, raw carrot, nuts'],
    tip: 'Texture progression: purée (6m) → mash (7–8m) → soft lumps (9–10m) → family foods (12m).',
  },
  '1-2y': {
    headline: 'Family Foods — 1 to 2 Years',
    summary: 'Join family meals with some modifications. Ensure variety from all 5 food groups every day.',
    meals: 5, frequency: '3 meals + 2 snacks',
    groups: [
      { name: 'Staples', icon: Wheat, iconColor: '#7C3AED', bg: '#F5F3FF', items: ['Rice (bhat) 3×/day', 'Roti or paratha (1–2 per day)', 'Boiled potato or sweet potato as snack'] },
      { name: 'Protein', icon: Fish, iconColor: '#2563EB', bg: '#EFF6FF', items: ['1 whole egg daily', 'Small fish: hilsa or rui (remove bones)', 'Mashed chicken or beef (small pieces)', 'Dal at every meal'] },
      { name: 'Vegetables', icon: Leaf, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['Green leafy vegetables (shak) daily', 'Pumpkin, drumstick (sajjna data)', 'Tomato, carrot, beans'] },
      { name: 'Fruits', icon: Leaf, iconColor: '#D97706', bg: '#FFF7ED', items: ['Banana (kola) — 1 per day', 'Ripe papaya (papaya)', 'Mango in season', 'Guava (peyara) — vitamin C'] },
    ],
    avoid: ['Fried fast food, chips, biscuits', 'Sweetened drinks (Fanta, juice packs)', 'Excess salt and sugar', 'Very spicy food'],
    tip: 'Continue breastfeeding until 2 years. This provides important nutrition and immunity.',
  },
  '2-3y': {
    headline: 'Growing Appetite — 2 to 3 Years',
    summary: 'Encourage self-feeding and varied tastes. Appetite may decrease — this is normal.',
    meals: 5, frequency: '3 meals + 2 snacks',
    groups: [
      { name: 'Energy', icon: Wheat, iconColor: '#7C3AED', bg: '#F5F3FF', items: ['Rice, roti or bread at every meal', 'Muri (puffed rice) as snack', 'Sweet potato or potato'] },
      { name: 'Protein', icon: Fish, iconColor: '#2563EB', bg: '#EFF6FF', items: ['Egg daily', 'Fish 5×/week', 'Dal (lentils) twice a day', 'Small amounts of meat 3×/week'] },
      { name: 'Vegetables', icon: Leaf, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['At least 2 different coloured vegetables daily', 'Encourage child to pick a vegetable at market', 'Boil, steam or lightly sauté — avoid deep frying'] },
      { name: 'Dairy', icon: Droplets, iconColor: '#D97706', bg: '#FFF7ED', items: ['Milk 1–2 glasses/day', 'Yogurt (doi) as snack', 'Paneer (chhana) occasionally'] },
    ],
    avoid: ['Energy drinks, coloured drinks', 'Very salty or spicy snacks', 'Commercially packaged biscuits as staple'],
    tip: 'Make mealtimes positive — no screens. Offer variety without forcing. It can take 10–15 tries before a child accepts a new food.',
  },
  '3-5y': {
    headline: 'Preschool Nutrition — 3 to 5 Years',
    summary: 'Balanced meals with all food groups. Good nutrition supports brain development and school readiness.',
    meals: 5, frequency: '3 meals + 2 snacks',
    groups: [
      { name: 'Grains', icon: Wheat, iconColor: '#7C3AED', bg: '#F5F3FF', items: ['Rice, roti, bread — 3 servings/day', 'Oats or suji porridge at breakfast', 'Avoid instant noodles as a staple'] },
      { name: 'Protein & Iron', icon: Fish, iconColor: '#2563EB', bg: '#EFF6FF', items: ['Eggs 1–2/day', 'Fish at least 5×/week', 'Red meat or chicken 3×/week', 'Legumes (dal, black-eyed peas) daily'] },
      { name: 'Vegetables & Fruits', icon: Leaf, iconColor: '#0A0A0A', bg: '#F5F5F5', items: ['5 servings of fruits and vegetables combined', 'Dark leafy greens: shak, spinach', 'Guava, banana, papaya, mango', 'Include one orange/yellow vegetable daily (vitamin A)'] },
      { name: 'Fluids', icon: Droplets, iconColor: '#D97706', bg: '#FFF7ED', items: ['Water 1.2–1.5 litres/day', 'Milk 1–2 glasses/day', 'Avoid fizzy drinks and packaged juices'] },
    ],
    avoid: ['Ultra-processed snacks (chips, instant noodles daily)', 'High-sugar foods', 'Excess screen time during meals'],
    tip: 'Vitamin A supplementation is given nationally twice per year. Ensure your child receives it at school or the nearest health centre.',
  },
};

export default function NutritionScreen() {
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

  const plan = PLANS[bracket];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>Nutrition Guide</Text>
          {ageLabel ? <Text style={{ fontSize: 12, color: '#737373' }}>{childName} · {ageLabel}</Text> : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>

        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Personalised for {childName}</Text>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>{plan.headline}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 21 }}>{plan.summary}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>{plan.meals}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>feeds/day</Text>
            </View>
            <View style={{ flex: 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>{plan.frequency}</Text>
            </View>
          </View>
        </Animated.View>

        {plan.groups.map((group, i) => (
          <Animated.View key={group.name} entering={FadeInDown.duration(400).delay(100 + i * 70)} style={{ backgroundColor: group.bg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <group.icon size={18} color={group.iconColor} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A' }}>{group.name}</Text>
            </View>
            {group.items.map((item, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: group.iconColor, marginTop: 8 }} />
                <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 }}>{item}</Text>
              </View>
            ))}
          </Animated.View>
        ))}

        {/* Avoid */}
        <Animated.View entering={FadeInDown.duration(400).delay(100 + plan.groups.length * 70 + 50)} style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 10 }}>Foods to Avoid</Text>
          {plan.avoid.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: '#DC2626', fontSize: 14, marginTop: -1 }}>✕</Text>
              <Text style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 }}>{item}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Tip */}
        <Animated.View entering={FadeInDown.duration(400).delay(100 + plan.groups.length * 70 + 120)} style={{ backgroundColor: '#F5F5F5', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0A0A0A', marginBottom: 6 }}>Pro Tip</Text>
          <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>{plan.tip}</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
