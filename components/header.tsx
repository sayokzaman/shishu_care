import { Bell, Menu } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2EEE8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#E8F7EE',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Menu color="#1F7A53" size={18} strokeWidth={2} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14 }}>🌱</Text>
          <Text style={{ color: '#1F7A53', fontSize: 18, fontWeight: '800' }}>ShishuCare</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          style={{
            backgroundColor: '#E8F7EE',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
          }}>
          <Text style={{ color: '#1F7A53', fontSize: 12, fontWeight: '600' }}>বাংলা</Text>
        </Pressable>
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
