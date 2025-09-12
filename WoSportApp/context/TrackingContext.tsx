import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import { useUser } from "../context/UserContext";
import {
  addComment,
  deleteComment,
  getPosts,
  toggleEncouragement,
} from "../services/api";

interface User {
  id: number;
  first_name: string;
}

interface Comment {
  id: number;
  body: string;
  user_id: number;
}

interface Encouragement {
  id: number;
  user_id: number;
}

interface Post {
  id: number;
  content: string;
  media_url?: string;
  comments_count: number;
  encouragements_count: number;
  user: User;
  comments: Comment[];
  encouragements: Encouragement[];
}

export default function SocialFeed() {
  const currentUser = useUser(); // 👈 récupère le user ici

  const [posts, setPosts] = useState<Post[]>([]);
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>(
    {}
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animValues, setAnimValues] = useState<{
    [key: number]: Animated.Value;
  }>({});

  const loadPosts = async (nextPage = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getPosts(nextPage);
      if (nextPage === 1) {
        setPosts(data);
      } else {
        const newPosts = data.filter(
          (p: Post) => !posts.some((x) => x.id === p.id)
        );
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const values: { [key: number]: Animated.Value } = {};
    posts.forEach((p) => {
      if (!animValues[p.id]) values[p.id] = new Animated.Value(0);
    });
    setAnimValues((prev) => ({ ...prev, ...values }));
  }, [posts]);

  const handleToggleEncourage = async (postId: number) => {
    if (!animValues[postId]) return;
    Animated.sequence([
      Animated.timing(animValues[postId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animValues[postId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    try {
      const data = await toggleEncouragement(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, encouragements_count: data.encouragements_count }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
    await addComment(postId, text);
    setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    loadPosts(1);
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
                comments_count: p.comments_count - 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Text style={styles.userName}>{item.user.first_name}</Text>
      <Text style={styles.content}>{item.content}</Text>

      {item.media_url && (
        <Pressable
          onPress={() => handleToggleEncourage(item.id)}
          style={styles.mediaContainer}
        >
          <Image source={{ uri: item.media_url }} style={styles.media} />
          {animValues[item.id] && (
            <Animated.Text
              style={[
                styles.animatedEmoji,
                {
                  opacity: animValues[item.id],
                  transform: [
                    {
                      scale: animValues[item.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            >
              💪
            </Animated.Text>
          )}
        </Pressable>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleToggleEncourage(item.id)}>
          <Text style={styles.actionText}>💪 {item.encouragements_count}</Text>
        </TouchableOpacity>
        <Text style={styles.actionText}>💬 {item.comments_count}</Text>
      </View>

      {item.comments.map((c) => (
        <View
          key={`comment-${c.id}`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={styles.comment}>{c.body}</Text>
          {currentUser &&
            currentUser.id === c.user_id && ( // 👈 check ici
              <TouchableOpacity
                onPress={() => handleDeleteComment(item.id, c.id)}
              >
                <Text style={{ color: "red", marginLeft: 8 }}>Supprimer</Text>
              </TouchableOpacity>
            )}
        </View>
      ))}

      <View style={styles.commentInputContainer}>
        <TextInput
          placeholder="Ajouter un commentaire..."
          style={styles.commentInput}
          value={commentTexts[item.id] || ""}
          onChangeText={(text) =>
            setCommentTexts((prev) => ({ ...prev, [item.id]: text }))
          }
        />
        <TouchableOpacity
          onPress={() => handleAddComment(item.id)}
          style={{ marginLeft: 8 }}
        >
          <FontAwesomeIcon icon={faPaperPlane} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={<Header />}
      data={posts}
      keyExtractor={(item) => `post-${item.id}`}
      renderItem={renderPost}
      onEndReached={() => loadPosts(page + 1)}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: 50 }}
    />
  );
}

const styles = StyleSheet.create({
  postContainer: { padding: 16, borderBottomWidth: 1, borderColor: "#ddd" },
  userName: { fontWeight: "bold", marginBottom: 4 },
  content: { marginBottom: 8 },
  mediaContainer: {
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  media: { width: "100%", height: 250, borderRadius: 8 },
  animatedEmoji: { position: "absolute", fontSize: 50 },
  actions: { flexDirection: "row", marginBottom: 8 },
  actionText: { marginRight: 16, fontWeight: "bold" },
  comment: { marginLeft: 8, color: "#555" },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 36,
  },
  sendIcon: { marginLeft: 10, color: "#000", fontWeight: "light" },
});
