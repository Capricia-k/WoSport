import { FontAwesome } from "@expo/vector-icons";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../components/AppText";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";
import { ApiPost, User, apiFetch, mapUserFromApi } from "../../../services/api";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#E24741", textAlign: "center" },
  noPostsText: { color: "#666", fontSize: 16 },
  avatarWrapper: {
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#D9B98C",
    borderRadius: 60,
    padding: 3,
    marginTop: 20,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  verifiedBadge: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  name: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    marginTop: 8,
  },
  bio: {
    marginHorizontal: 30,
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E8DCC8",
    borderRadius: 16,
    marginHorizontal: 40,
    paddingVertical: 12,
    marginTop: 20,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 14, color: "#666", marginTop: 4 },
  toast: {
    position: "absolute",
    top: 50,
    left: 50,
    right: 50,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: "center",
  },
  toastText: { color: "#fff", fontWeight: "600" },
  gridContainer: { padding: 1, marginTop: 20 },
  postWrapper: { position: "relative", width: "33.33%" },
  postImage: { width: "100%", aspectRatio: 1, borderRadius: 8, margin: 1 },
  moreButton: { position: "absolute", top: 4, right: 4, zIndex: 10 },
});

interface MyVideoProps {
  uri: string;
  style?: any;
}
interface Story {
  id: number;
  media: Array<{ url: string; content_type: string; filename: string }>;
  created_at: string;
  expires_at: string;
  user: { id: number; first_name: string; avatar_url: string };
}
interface StoriesResponse {
  user: { id: number; first_name: string; avatar_url: string };
  stories: Story[];
}

const Video: React.FC<MyVideoProps> = ({ uri, style }) => (
  <ExpoVideo
    source={{ uri }}
    style={style}
    resizeMode={ResizeMode.COVER}
    useNativeControls
    isLooping
  />
);

export default function MyProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useUser();
  const userId = params.userId || params.id || params.targetUserId;
  const targetUserId = userId ? Number(userId) : currentUser?.id;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<ApiPost | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openEditModal = (post: ApiPost) => {
    setEditingPost(post);
    setNewTitle((post as any).title || "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    try {
      await apiFetch(`posts/${editingPost.id}`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ title: newTitle }),
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id ? { ...p, title: newTitle } : p
        )
      );
      showToast("Post modifié !");
      setEditModalVisible(false);
    } catch {
      showToast("Erreur lors de la modification");
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await apiFetch(`posts/${postId}`, { method: "DELETE", auth: true });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post supprimé !");
    } catch {
      showToast("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const rawUser = await apiFetch<any>(`users/${targetUserId}`, {
          auth: true,
        });
        setProfileUser(mapUserFromApi(rawUser));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        setPosts(
          await apiFetch<ApiPost[]>(`posts?user_id=${targetUserId}`, {
            auth: true,
          })
        );
      } finally {
        setPostsLoading(false);
      }
    };
    const fetchStories = async () => {
      try {
        const response = await apiFetch<StoriesResponse[]>(
          `stories?user_id=${targetUserId}`,
          { auth: true }
        );
        setStories(response.length > 0 ? response[0].stories : []);
      } catch {
        setStories([]);
      }
    };
    fetchProfile();
    fetchPosts();
    fetchStories();
  }, [targetUserId]);

  if (!targetUserId)
    return (
      <View style={styles.centerContainer}>
        <Text>Utilisateur introuvable</Text>
      </View>
    );
  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  if (error)
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorText}>{error}</AppText>
      </View>
    );
  if (!profileUser)
    return (
      <View style={styles.centerContainer}>
        <AppText>User not found</AppText>
      </View>
    );

  const avatarSource = profileUser.avatar_url
    ? { uri: profileUser.avatar_url }
    : {
        uri: `https://ui-avatars.com/api/?name=${profileUser.first_name}&background=D9B98C&color=fff`,
      };

  return (
    <SafeAreaView style={styles.container}>
      <SocialHeader />
      <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      <TouchableOpacity
        onPress={() =>
          stories.length > 0 &&
          router.push({
            pathname: "/screens/social/story/ViewStory",
            params: { userId: profileUser.id.toString() },
          })
        }
      >
        <View style={styles.avatarWrapper}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>
      </TouchableOpacity>

      <Text style={styles.name}>
        {profileUser.first_name} {profileUser.last_name || ""}
      </Text>
      <Text style={styles.verifiedBadge}>(Verified)</Text>
      {profileUser.bio && <Text style={styles.bio}>{profileUser.bio}</Text>}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {(profileUser.followers ?? []).length}
          </Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {(profileUser.following ?? []).length}
          </Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {postsLoading ? (
          <ActivityIndicator
            size="small"
            color="#E24741"
            style={{ margin: 16 }}
          />
        ) : posts.length === 0 ? (
          <View style={styles.centerContainer}>
            <AppText style={styles.noPostsText}>
              Aucun post pour l’instant
            </AppText>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <View style={styles.postWrapper}>
                {item.videos?.length ? (
                  <Video uri={item.videos[0].url} style={styles.postImage} />
                ) : (
                  <Image
                    source={{ uri: item.photos?.[0]?.url }}
                    style={styles.postImage}
                  />
                )}
                {item.user?.id === currentUser?.id && (
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() =>
                      Alert.alert(
                        "Options du post",
                        "",
                        [
                          { text: "Annuler", style: "cancel" },
                          {
                            text: "Modifier",
                            onPress: () => openEditModal(item),
                          },
                          {
                            text: "Supprimer",
                            style: "destructive",
                            onPress: () => handleDeletePost(item.id),
                          },
                        ],
                        { cancelable: true }
                      )
                    }
                  >
                    <FontAwesome name="ellipsis-v" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Modifier le post
            </Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Titre du post"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 8,
                borderRadius: 6,
                marginBottom: 16,
              }}
            />
            <Button title="Enregistrer" onPress={handleSaveEdit} />
            <Button
              title="Annuler"
              onPress={() => setEditModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
