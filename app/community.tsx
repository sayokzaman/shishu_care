import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Plus, Search, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/header';

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  body: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Fatema Begum',
    avatar: 'FB',
    time: '2h ago',
    tag: 'Feeding',
    tagColor: '#D97706',
    tagBg: '#FFF7ED',
    body: "My 8-month-old suddenly refuses to eat khichuri. He was fine with it last week. Has anyone experienced this? The doctor said it's normal but I am worried.",
    likes: 14,
    comments: 6,
    liked: false,
  },
  {
    id: '2',
    author: 'Rina Akter',
    avatar: 'RA',
    time: '4h ago',
    tag: 'Sleep',
    tagColor: '#4F46E5',
    tagBg: '#EEF2FF',
    body: "Alhamdulillah! Finally got my 18-month-old to sleep through the night after following the routine suggested here. Consistent bedtime at 9pm, bath, story, song. Two weeks and it's working! 🌙",
    likes: 42,
    comments: 18,
    liked: false,
  },
  {
    id: '3',
    author: 'Shirin Chowdhury',
    avatar: 'SC',
    time: '6h ago',
    tag: 'Health',
    tagColor: '#DC2626',
    tagBg: '#FEF2F2',
    body: "Quick question — my 3-year-old has had a fever of 38.5°C since yesterday. I gave paracetamol and she's eating. Should I take her to the upazila hospital today or wait another day?",
    likes: 7,
    comments: 23,
    liked: false,
  },
  {
    id: '4',
    author: 'Nusrat Islam',
    avatar: 'NI',
    time: '1d ago',
    tag: 'Development',
    tagColor: '#0A0A0A',
    tagBg: '#F5F5F5',
    body: "My son is 2 years old and only says about 20 words. My mother-in-law says it's because we speak two languages at home. The health worker said it might be delayed. We have an appointment booked. Fingers crossed 🤞",
    likes: 31,
    comments: 12,
    liked: false,
  },
  {
    id: '5',
    author: 'Halima Sultana',
    avatar: 'HS',
    time: '1d ago',
    tag: 'Vaccination',
    tagColor: '#7C3AED',
    tagBg: '#F5F3FF',
    body: "Reminder for all parents in Chittagong district — the national immunisation day is this Saturday at your nearest community clinic. Don't miss the MR2 dose if your child is 15 months!",
    likes: 58,
    comments: 4,
    liked: false,
  },
  {
    id: '6',
    author: 'Parveen Khanam',
    avatar: 'PK',
    time: '2d ago',
    tag: 'Nutrition',
    tagColor: '#0A0A0A',
    tagBg: '#F5F5F5',
    body: "I started adding a small egg to my 10-month-old's khichuri every day and the improvement in her energy is visible. The health worker recommended it at our last visit. Highly recommend!",
    likes: 25,
    comments: 9,
    liked: false,
  },
];

const TAGS = ['All', 'Feeding', 'Sleep', 'Health', 'Vaccination', 'Development', 'Nutrition'];

function Avatar({ initials }: { initials: string }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#0A0A0A',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>{initials}</Text>
    </View>
  );
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newBody, setNewBody] = useState('');
  const [newTag, setNewTag] = useState('Feeding');

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const submitPost = () => {
    if (!newBody.trim()) return;
    const tagMeta: Record<string, { color: string; bg: string }> = {
      Feeding: { color: '#D97706', bg: '#FFF7ED' },
      Sleep: { color: '#4F46E5', bg: '#EEF2FF' },
      Health: { color: '#DC2626', bg: '#FEF2F2' },
      Vaccination: { color: '#7C3AED', bg: '#F5F3FF' },
      Development: { color: '#0A0A0A', bg: '#F5F5F5' },
      Nutrition: { color: '#0A0A0A', bg: '#F5F5F5' },
    };
    const meta = tagMeta[newTag] || { color: '#737373', bg: '#F5F5F5' };
    setPosts((prev) => [
      {
        id: Date.now().toString(),
        author: 'You',
        avatar: 'ME',
        time: 'Just now',
        tag: newTag,
        tagColor: meta.color,
        tagBg: meta.bg,
        body: newBody.trim(),
        likes: 0,
        comments: 0,
        liked: false,
      },
      ...prev,
    ]);
    setNewBody('');
    setModalVisible(false);
  };

  const filtered = posts.filter((p) => {
    const matchTag = activeTag === 'All' || p.tag === activeTag;
    const matchSearch = !search || p.body.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {/* Header */}
      <Header title="Community" emoji="👩‍👩‍👧‍👦">
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: '#0F5238',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Plus size={20} color="white" />
        </Pressable>
      </Header>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 44,
            gap: 8,
          }}>
          <Search size={15} color="#A3A3A3" />
          <TextInput
            placeholder="Search posts…"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, fontSize: 14, color: '#0A0A0A' }}
            placeholderTextColor="#A3A3A3"
          />
        </View>
      </View>

      {/* Tag filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingLeft: 16, paddingBottom: 20, maxHeight: 46 }}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {TAGS.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => setActiveTag(tag)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              height: 32,
              backgroundColor: activeTag === tag ? '#0F5238' : '#F5F5F5',
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: activeTag === tag ? 'white' : '#737373',
              }}>
              {tag}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        {filtered.map((post, i) => (
          <Animated.View
            key={post.id}
            entering={FadeInDown.duration(400).delay(i * 60)}
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              padding: 16,
              marginBottom: 12,
              backgroundColor: '#FFFFFF',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar initials={post.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0A0A0A' }}>
                  {post.author}
                </Text>
                <Text style={{ fontSize: 11, color: '#A3A3A3' }}>{post.time}</Text>
              </View>
              <View
                style={{
                  backgroundColor: post.tagBg,
                  borderRadius: 8,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: post.tagColor }}>
                  {post.tag}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 12 }}>
              {post.body}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable
                onPress={() => toggleLike(post.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Heart
                  size={16}
                  color={post.liked ? '#DC2626' : '#A3A3A3'}
                  fill={post.liked ? '#DC2626' : 'none'}
                />
                <Text style={{ fontSize: 13, color: post.liked ? '#DC2626' : '#A3A3A3' }}>
                  {post.likes}
                </Text>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MessageCircle size={16} color="#A3A3A3" />
                <Text style={{ fontSize: 13, color: '#A3A3A3' }}>{post.comments}</Text>
              </View>
            </View>
          </Animated.View>
        ))}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 14, color: '#A3A3A3' }}>No posts found.</Text>
          </View>
        )}
      </ScrollView>

      {/* New post modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#F5F5F5',
            }}>
            <Pressable onPress={() => setModalVisible(false)} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 15, color: '#737373' }}>Cancel</Text>
            </Pressable>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#0A0A0A', flex: 1 }}>
              New Post
            </Text>
            <Pressable
              onPress={submitPost}
              style={{
                backgroundColor: '#0F5238',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}>
              <Send size={14} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Post</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
              }}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
              {TAGS.filter((t) => t !== 'All').map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setNewTag(tag)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: newTag === tag ? '#0A0A0A' : '#F5F5F5',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: newTag === tag ? 'white' : '#737373',
                    }}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
              }}>
              Your Post
            </Text>
            <TextInput
              multiline
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Share a tip, question or experience with the community…"
              placeholderTextColor="#A3A3A3"
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 14,
                padding: 14,
                fontSize: 15,
                color: '#0A0A0A',
                minHeight: 140,
                textAlignVertical: 'top',
                backgroundColor: '#FAFAFA',
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
