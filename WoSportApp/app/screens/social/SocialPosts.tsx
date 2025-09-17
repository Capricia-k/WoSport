import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { AppText } from "../../../components/AppText";
import Header from "../../../components/Header";
import { Visibility } from "../../../services/api";

interface Post {
  id: number;
  content: string;
  photos: { url: string }[];
  created_at: string;
  visibility: Visibility;
}

interface SocialPostsProps {
  userId: number;
  token: string;
  onPressPost?: (postId: number) => void;
}

export default function SocialPosts({
  userId,
  token,
  onPressPost,
}: SocialPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/posts?user_id=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Erreur fetch posts");
      const data: Post[] = await res.json();
      setPosts(data.filter((p) => p.visibility === "public"));
    } catch (err) {
      console.error("[SocialPosts] erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E8DCC8" }}>
      <Header />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#E24741" />
      ) : posts.length === 0 ? (
        <AppText style={styles.noPostsText}>
          Aucun post public à afficher 🌱
        </AppText>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() => onPressPost?.(post.id)}
              style={styles.postWrapper}
            >
              <Image
                source={{ uri: post.photos[0]?.url }}
                style={styles.photo}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  noPostsText: { textAlign: "center", marginTop: 20, color: "#555" },
  postWrapper: { width: "32%", margin: "1%" },
  photo: { width: "100%", height: 120, borderRadius: 8 },
});
