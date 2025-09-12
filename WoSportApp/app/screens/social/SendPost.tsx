import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";

interface User {
  id: number;
  first_name: string;
  avatar_url?: string;
}

interface Comment {
  id: number;
  body: string;
  user: User;
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  user: User;
  photos?: { url: string }[];
  videos?: { url: string }[];
  comments_count?: number;
  encouragements_count?: number;
  comments?: Comment[];
}

export default function SendPost() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { currentUser } = useUser();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    if (!postId || !currentUser) return;

    try {
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/posts/${postId}`,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch post");

      const data = await res.json();
      console.log("Post reçu:", data);
      setPost(data);
    } catch (err) {
      console.error("Erreur fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>⚠️ Post introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <SocialHeader />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Auteur du post */}
        {post.user && (
          <TouchableOpacity
            style={styles.authorBox}
            onPress={() =>
              router.push(
                `/screens/social/UserProfile?targetUserId=${post.user.id}`
              )
            }
          >
            {post.user.avatar_url && (
              <Image
                source={{ uri: post.user.avatar_url }}
                style={styles.avatar}
              />
            )}
            <Text style={styles.authorName}>{post.user.first_name}</Text>
          </TouchableOpacity>
        )}

        {/* Médias */}
        {post.photos && post.photos.length > 0 && (
          <ScrollView horizontal style={{ marginBottom: 12 }}>
            {post.photos.map((p, idx) => (
              <Image key={idx} source={{ uri: p.url }} style={styles.image} />
            ))}
          </ScrollView>
        )}

        {post.videos && post.videos.length > 0 && (
          <ScrollView horizontal style={{ marginBottom: 12 }}>
            {post.videos.map((v, idx) => (
              <Video
                key={idx}
                source={{ uri: v.url }}
                style={styles.image}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping
              />
            ))}
          </ScrollView>
        )}

        {/* Contenu texte */}
        <Text style={styles.content}>{post.content}</Text>

        {/* Statistiques */}
        <Text style={styles.stats}>
          💪 {post.encouragements_count || 0} | 💬 {post.comments_count || 0}
        </Text>

        {/* Liste des commentaires */}
        {post.comments?.map((c) => (
          <View key={c.id} style={styles.commentRow}>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/screens/social/UserProfile?targetUserId=${c.user.id}`
                )
              }
            >
              <Image
                source={{ uri: c.user.avatar_url }}
                style={styles.commentAvatar}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.commentName}>{c.user.first_name}</Text>
              <Text style={styles.commentText}>{c.body}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  authorBox: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  authorName: { fontWeight: "600", fontSize: 16 },
  image: {
    width: 400,
    height: 420,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { fontSize: 22, color: "#333", marginBottom: 15 },
  stats: { fontWeight: "600", marginBottom: 16 },
  commentRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentName: { fontWeight: "600" },
  commentText: { color: "#333" },
  backBtn: { marginTop: 16 },
  backText: { color: "#E24741", fontWeight: "800", fontSize: 16 },
});
