import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { router } from 'expo-router';
import { ArrowLeft, Bot, ChevronRight, Send, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';

interface Message { id: string; role: 'user' | 'bot'; text: string; timestamp: string; }

const QUICK_QUESTIONS = [
  'Can I give honey to my baby?',
  'Is colostrum good for newborns?',
  'When can I give water to my baby?',
  'Do vaccines cause autism?',
  'When should I start solid food?',
  'Is baby walker helpful?',
];

function now() { return new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }); }

async function askBot(userMessage: string, history: Message[]): Promise<string> {
  const data = await sendRequest('/api/chatbot/chat', 'POST', { message: userMessage, history } as any);
  return data.reply;
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: 'Hello! I\'m ShishuCare\'s Myth Buster, powered by AI. Ask me anything about child health myths in Bangladesh. Try questions like "Is honey safe for babies?" or "Do vaccines cause autism?"', timestamp: now() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const answer = await askBot(text.trim(), messages);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: answer, timestamp: now() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: 'Sorry, I couldn\'t reach the server. Please check your connection and try again.', timestamp: now() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <ArrowLeft size={18} color="#0A0A0A" />
        </Pressable>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Bot size={18} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0A0A0A' }}>Myth Buster</Text>
          <Text style={{ fontSize: 11, color: '#737373' }}>Fact-checks child health myths</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>

          {/* Quick questions */}
          <Animated.View entering={FadeInDown.duration(400).delay(50)} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#A3A3A3', marginBottom: 8 }}>QUICK QUESTIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {QUICK_QUESTIONS.map(q => (
                <Pressable key={q} onPress={() => sendMessage(q)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 12, color: '#374151', maxWidth: 160 }}>{q}</Text>
                  <ChevronRight size={12} color="#A3A3A3" />
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Messages */}
          {messages.map((msg) => (
            <Animated.View key={msg.id} entering={msg.role === 'user' ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={{ marginBottom: 12, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' }}>
                {msg.role === 'bot' && (
                  <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                    <Bot size={13} color="white" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: msg.role === 'user' ? '#0A0A0A' : '#F5F5F5', borderRadius: 18, borderBottomRightRadius: msg.role === 'user' ? 4 : 18, borderBottomLeftRadius: msg.role === 'bot' ? 4 : 18, padding: 12 }}>
                    <Text style={{ fontSize: 14, color: msg.role === 'user' ? 'white' : '#0A0A0A', lineHeight: 21 }}>{msg.text}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: '#A3A3A3', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.timestamp}</Text>
                </View>
                {msg.role === 'user' && (
                  <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                    <User size={13} color="#737373" />
                  </View>
                )}
              </View>
            </Animated.View>
          ))}

          {typing && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={13} color="white" />
              </View>
              <View style={{ backgroundColor: '#F5F5F5', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, flexDirection: 'row', gap: 4 }}>
                {[0, 1, 2].map(d => (
                  <View key={d} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#A3A3A3' }} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 20, gap: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about a myth…"
            placeholderTextColor="#A3A3A3"
            multiline
            style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0A0A0A', maxHeight: 100 }}
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable onPress={() => sendMessage(input)} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: input.trim() && !typing ? '#0A0A0A' : '#E5E5E5', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} color={input.trim() && !typing ? 'white' : '#A3A3A3'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
