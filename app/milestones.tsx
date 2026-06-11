import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { CheckCircle, Circle } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/header';

type AgeBracket = 'prenatal' | '0-1m' | '1-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';
type MilestoneDomain = 'motor' | 'language' | 'social' | 'cognitive' | 'health';

interface ApiMilestone {
  id: number;
  domain: MilestoneDomain;
  textEn: string;
  isKey: boolean;
  isAchieved: boolean;
  flagged: boolean;
}

const BRACKET_TITLE: Record<AgeBracket, string> = {
  prenatal: 'Prenatal Wellbeing Checklist',
  '0-1m': 'Newborn Milestones (0–4 weeks)',
  '1-6m': 'Early Infancy Milestones (1–6 months)',
  '6-12m': 'Later Infancy Milestones (6–12 months)',
  '1-2y': 'Toddler Milestones (12–24 months)',
  '2-3y': 'Early Toddler Milestones (2–3 years)',
  '3-5y': 'Preschool Milestones (3–5 years)',
};

const DOMAIN_META = {
  motor: { color: '#7C3AED', label: 'Motor' },
  language: { color: '#2563EB', label: 'Language' },
  social: { color: '#D97706', label: 'Social' },
  cognitive: { color: '#0A0A0A', label: 'Cognitive' },
  health: { color: '#DC2626', label: 'Health' },
};

export default function MilestonesScreen() {
  const { isLoading: authLoading } = useAuth();
  const [ageLabel, setAgeLabel] = useState('');
  const [bracket, setBracket] = useState<AgeBracket>('1-6m');
  const [milestones, setMilestones] = useState<ApiMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const fetchMilestones = useCallback(async (ageBracket: AgeBracket) => {
    setLoading(true);
    try {
      const res = await sendRequest(`/api/milestones?ageBracket=${ageBracket}`);
      if (res?.milestones) setMilestones(res.milestones);
    } catch (_) {
      // keep empty list on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadChild().then((c) => {
      if (!c) {
        fetchMilestones(bracket);
        return;
      }
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
      const b = getAgeBracket(m) as AgeBracket;
      setBracket(b);
      fetchMilestones(b);
    });
  }, [authLoading]);

  const toggle = async (milestoneId: number) => {
    if (toggling.has(milestoneId)) return;
    setToggling((prev) => new Set(prev).add(milestoneId));
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, isAchieved: !m.isAchieved } : m))
    );
    try {
      await sendRequest(`/api/milestones/${milestoneId}/toggle`, 'PATCH', {} as any);
    } catch (_) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, isAchieved: !m.isAchieved } : m))
      );
    } finally {
      setToggling((prev) => {
        const s = new Set(prev);
        s.delete(milestoneId);
        return s;
      });
    }
  };

  const total = milestones.length;
  const done = milestones.filter((m) => m.isAchieved).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <Header title="Milestones" emoji="🎉">
        <View
          style={{
            backgroundColor: '#0F5238',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>
            {done}/{total}
          </Text>
        </View>
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <Animated.View
          entering={FadeInDown.duration(400).delay(50)}
          style={{ backgroundColor: '#0F5238', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <View className="bg-accent mb-2 w-fit rounded-full px-3 py-1 font-extrabold text-white">
            <Text>{ageLabel}</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 12 }}>
            {BRACKET_TITLE[bracket]}
          </Text>
          <View
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: 'white',
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>
            {percent}% complete · {done} of {total} milestones
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {Object.entries(DOMAIN_META).map(([key, val]) => (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: val.color }} />
              <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>{val.label}</Text>
            </View>
          ))}
        </Animated.View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0A0A0A" />
          </View>
        ) : (
          <>
            {milestones.map((item, i) => {
              const domain = DOMAIN_META[item.domain];
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.duration(400).delay(100 + i * 50)}>
                  <Pressable
                    onPress={() => toggle(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: 14,
                      marginBottom: 8,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: item.isAchieved ? '#0A0A0A' : '#E5E5E5',
                      backgroundColor: item.isAchieved ? '#F5F5F5' : '#FFFFFF',
                      opacity: toggling.has(item.id) ? 0.6 : 1,
                    }}>
                    {item.isAchieved ? (
                      <CheckCircle size={22} color="#0A0A0A" strokeWidth={2.5} />
                    ) : (
                      <Circle size={22} color="#D4D4D4" strokeWidth={1.5} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: item.isAchieved ? '#737373' : '#0A0A0A',
                          lineHeight: 21,
                          textDecorationLine: item.isAchieved ? 'line-through' : 'none',
                        }}>
                        {item.textEn}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4,
                        }}>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: domain.color,
                          }}
                        />
                        <Text style={{ fontSize: 11, color: domain.color, fontWeight: '600' }}>
                          {domain.label}
                        </Text>
                        {item.isKey && (
                          <Text
                            style={{
                              fontSize: 10,
                              color: '#9CA3AF',
                              marginLeft: 6,
                              fontWeight: '700',
                            }}>
                            KEY
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}

            {done < total && milestones.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(400).delay(200 + milestones.length * 50)}
                style={{
                  backgroundColor: '#FFF7ED',
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#FED7AA',
                }}>
                <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 20 }}>
                  <Text style={{ fontWeight: '700' }}>Note: </Text>
                  If your child has not reached several milestones, speak with a health worker at
                  your nearest Community Clinic or Upazila Health Complex. WHO-based milestones have
                  a range — some variation is normal.
                </Text>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
