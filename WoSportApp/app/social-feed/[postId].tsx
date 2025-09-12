import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "../../components/AppText";

interface Post {
  id: number;
  content: string;
  photos: { url: string }[];
  videos: { url: string }[];
  created_at: string;
}

export default function SocialFeedPost() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(
          `http://192.168.1.164:3000/api/v1/posts/${postId}`
        );
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("[SocialFeedPost] erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  }

  if (!post) {
    return <AppText style={styles.message}>Post introuvable 😔</AppText>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText style={styles.date}>
        {new Date(post.created_at).toLocaleDateString()}
      </AppText>
      <AppText style={styles.content}>{post.content}</AppText>

      {post.photos.map((photo, idx) => (
        <Image key={idx} source={{ uri: photo.url }} style={styles.media} />
      ))}

      {post.videos.map((video, idx) => (
        <Video
          key={idx}
          source={{ uri: video.url }}
          style={styles.media}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { textAlign: "center", marginTop: 20, fontSize: 16 },
  date: { fontWeight: "600", marginBottom: 8 },
  content: { marginBottom: 12, fontSize: 16 },
  media: { width: "100%", height: 180, borderRadius: 8, marginBottom: 12 },
});
