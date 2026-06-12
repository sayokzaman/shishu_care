import { formatAge, getAgeBracket, getAgeMonths, loadChild } from '@/lib/child';
import { AgeBracket } from '@/types/age-bracket';
import { RelativePathString, router } from 'expo-router';
import { Bell, ChevronLeft, Menu } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({
  title,
  emoji,
  children,
  secondaryText,
}: {
  title: string;
  emoji?: string;
  children?: React.ReactNode;
  secondaryText?: string;
}) => {
  const insets = useSafeAreaInsets();

  const [childName, setChildName] = useState('Your Child');
  const [ageLabel, setAgeLabel] = useState('');
  const [bracket, setBracket] = useState<AgeBracket>('1-6m');

  useEffect(() => {
    loadChild().then((c) => {
      if (!c) return;
      setChildName(c.name);
      const m = getAgeMonths(c.dob);
      setAgeLabel(formatAge(m));
      setBracket(getAgeBracket(m) as AgeBracket);
    });
  }, []);

  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2EEE8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {router.canGoBack() && (
          <Pressable onPress={() => router.back()}>
            <ChevronLeft color="#1F7A53" size={24} strokeWidth={2} />
          </Pressable>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14 }}>{emoji || '🌱'}</Text>
          <View>
            <Text style={{ color: '#1F7A53', fontSize: 20, fontWeight: '800' }}>{title}</Text>
            {secondaryText ? (
              <Text style={{ color: '#6B7280', fontSize: 12 }}>{secondaryText}</Text>
            ) : (
              <Text style={{ color: '#6B7280', fontSize: 12 }}>
                {childName}
                {ageLabel ? ` · ${ageLabel}` : ''}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {children ? children : null}
        <Pressable
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#F6FCF8',
            borderWidth: 1,
            borderColor: '#E2EEE8',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Bell color="#6B7280" size={17} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
