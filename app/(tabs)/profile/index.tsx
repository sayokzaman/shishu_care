import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Uniwind } from 'uniwind';

export default function ProfilePage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const toggleTheme = () => {
    let theme: 'light' | 'dark' = Uniwind.currentTheme === 'light' ? 'dark' : 'light';
    Uniwind.setTheme(theme);
  };

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text variant="h2">Profile</Text>

      <Button
        variant="outline"
        size="sm"
        className="border-border h-auto rounded-full px-3.5 py-1.5"
        onPress={handleLogout}>
        <Text className="text-destructive text-[13px]">Logout</Text>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="border-border h-auto rounded-full px-3.5 py-1.5"
        onPress={toggleTheme}>
        <Text className="text-foreground text-[13px]">Toggle Theme</Text>
      </Button>
    </View>
  );
}
