import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  AlertTriangle,
  ChevronDown,
  ClipboardList,
  Lightbulb,
  Menu,
  Mic,
  Sparkles,
  Syringe,
  Utensils,
} from 'lucide-react-native';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CHILD = {
  name: 'Aayan',
  age: '8M',
  parentName: 'Sarah',
  greeting: 'Good morning',
  carePlanText: 'Here is the care plan for Aayan today.',
};

const CARE_ITEMS = [
  { id: '1', label: 'Morning Feeding', done: true },
  { id: '2', label: 'Vitamin D Drops', done: true },
  { id: '3', label: 'Tummy Time / Stimulation', done: false },
];

const VACCINATION = {
  label: 'Measles (9 Months)',
  progress: 0.8,
  progressText: '80%',
};

export default function HomeScreen() {
  const doneCare = CARE_ITEMS.filter((i) => i.done).length;

  return (
    <View className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* ── Greeting ── */}
        <View className="flex-row items-center gap-3.5 px-5 pt-6 pb-1.5">
          <View className="relative">
            <View className="bg-brand-avatar-bg border-primary h-16 w-16 items-center justify-center rounded-full border-2">
              <Text className="text-[28px]">👶</Text>
            </View>
            <View className="bg-primary absolute -right-1 -bottom-0.5 rounded-lg px-1.5 py-0.5">
              <Text className="text-primary-foreground text-[10px] font-bold">{CHILD.age}</Text>
            </View>
          </View>
          <View className="flex-1 gap-0.5">
            <View className="flex-row items-center gap-1">
              <Text className="text-muted-foreground text-[13px] font-medium">
                {CHILD.name}&apos;s Profile
              </Text>
              <Icon as={ChevronDown} color="#9CA3AF" size={14} />
            </View>
            <Text className="text-foreground text-xl font-extrabold">
              {CHILD.greeting}, {CHILD.parentName}!
            </Text>
          </View>
        </View>
        <Text className="text-muted-foreground px-5 pb-5 text-sm">{CHILD.carePlanText}</Text>

        {/* ── AI command center ── */}
        <View className="mb-4 gap-2.5 px-5">
          <View className="bg-card border-border flex-row items-center gap-2.5 rounded-xl border px-3.5 py-2.5">
            <Icon as={Sparkles} color="#9CA3AF" size={20} />
            <TextInput
              className="text-foreground flex-1 py-1.5 text-sm"
              placeholder="Ask NurtureAI... (e.g., My baby has a mild fever)"
              placeholderTextColor="#9CA3AF"
            />
            <Button variant="ghost" size="icon" className="bg-brand-mic-bg h-9 w-9 rounded-full">
              <Icon as={Mic} color="#4B5563" size={17} />
            </Button>
          </View>
          <Button
            variant="outline"
            className="border-brand-risk-border bg-brand-risk-bg h-auto gap-2 rounded-xl py-3.5">
            <Icon as={AlertTriangle} color="#C53030" size={17} />
            <Text className="text-brand-risk-text text-[15px] font-bold">Risk Check</Text>
          </Button>
        </View>

        {/* ── Milestone alert ── */}
        <View className="bg-brand-milestone-bg border-brand-milestone-border mx-5 mb-4 flex-row items-start gap-3 rounded-xl border p-4">
          <View className="pt-0.5">
            <Lightbulb color="#F59E0B" size={26} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-brand-milestone-text text-[10px] font-extrabold tracking-wide">
              INSIGHT: MILESTONE ALERT
            </Text>
            <Text className="text-brand-milestone-text text-sm leading-5 font-bold">
              {CHILD.name} should be starting to crawl now. Try this floor activity!
            </Text>
          </View>
        </View>

        {/* ── Today's care ── */}
        <View className="mb-4 px-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-primary text-lg font-bold">Today&apos;s Care</Text>
            <Text className="text-muted-foreground text-[13px] font-medium">
              {doneCare} of {CARE_ITEMS.length} Done
            </Text>
          </View>
          <View className="bg-card border-border overflow-hidden rounded-xl border">
            {CARE_ITEMS.map((item, idx) => (
              <View
                key={item.id}
                className={`flex-row items-center gap-3.5 px-4 py-3.5 ${
                  idx < CARE_ITEMS.length - 1 ? 'border-border border-b' : ''
                }`}>
                <View
                  className={`h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                    item.done ? 'bg-primary border-primary' : 'border-brand-input-border'
                  }`}>
                  {item.done && (
                    <Text className="text-primary-foreground text-[11px] font-extrabold">✓</Text>
                  )}
                </View>
                <Text
                  className={`flex-1 text-[15px] ${
                    item.done ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Vaccination tracker ── */}
        <View className="bg-brand-hero mx-5 mb-4 gap-3 rounded-[14px] p-4">
          <View className="flex-row items-start justify-between">
            <View className="gap-0.5">
              <Text className="text-[10px] font-bold tracking-wide text-white/70">
                VACCINATION TRACKER
              </Text>
              <Text className="text-[15px] font-bold text-white">{VACCINATION.label}</Text>
            </View>
            <Syringe color="rgba(255,255,255,0.8)" size={22} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-white/85">Progress</Text>
            <Text className="text-[13px] font-bold text-white">{VACCINATION.progressText}</Text>
          </View>
          <View className="h-2 rounded-full bg-white/25">
            <View
              className="h-2 rounded-full bg-white"
              style={{ width: `${VACCINATION.progress * 100}%` }}
            />
          </View>
        </View>

        {/* ── Widget grid ── */}
        <View className="mb-8 flex-row gap-3 px-5">
          <Button variant="outline" className="border-border h-auto w-1/2">
            <View className="flex flex-1 flex-col items-center gap-3 rounded-[14px] p-4">
              <View className="bg-brand-primary-light h-13 w-13 items-center justify-center rounded-full">
                <Utensils color="#1A6B47" size={24} strokeWidth={1.8} />
              </View>
              <Text className="text-foreground text-center text-[13px] leading-[18px] font-semibold">
                Age-based{'\n'}Feeding Guide
              </Text>
            </View>
          </Button>
          <Button
            variant="outline"
            className="border-border h-auto w-1/2 flex-1 flex-col gap-3 rounded-[14px] p-4">
            <View className="bg-brand-primary-light h-13 w-13 items-center justify-center rounded-full">
              <ClipboardList color="#1A6B47" size={24} strokeWidth={1.8} />
            </View>
            <Text className="text-foreground text-center text-[13px] leading-[18px] font-semibold">
              Visit Log{'\n'}& Symptoms
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
