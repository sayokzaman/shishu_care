import { View, Text } from 'react-native';
import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-card border-border fixed top-0 right-0 left-0 z-10 min-h-16 flex-row items-center justify-between border-b px-5 pb-3.5"
      style={{ paddingTop: insets.top + 10 }}>
      <View className="flex-row items-center gap-2.5">
        <Icon as={Menu} color="#1A6B47" size={22} strokeWidth={2} />
        <Text className="text-primary text-xl font-bold">ShishuCare</Text>
      </View>

      <View className="flex-row gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="border-border h-auto rounded-full px-3.5 py-1.5">
          <Text className="text-foreground text-[13px]">বাংলা</Text>
        </Button>
      </View>
    </View>
  );
};

export default Header;
