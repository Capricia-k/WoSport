import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
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
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 20,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  stats: { flexDirection: "row", flex: 1, justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 14, color: "#666", marginTop: 4 },
  bio: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  name: { fontWeight: "bold", fontSize: 18, color: "#333" },
  bioText: { marginTop: 6, color: "#666", lineHeight: 20 },
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
  gridContainer: { padding: 1 },
  storyRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: "#E24741",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  storyIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#E24741",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  storyIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

interface MyVideoProps {
  uri: string;
  style?: any;
}

interface Story {
  id: number;
  media: Array<{
    url: string;
    content_type: string;
    filename: string;
  }>;
  created_at: string;
  expires_at: string;
  user: {
    id: number;
    first_name: string;
    avatar_url: string;
  };
}

interface StoriesResponse {
  user: {
    id: number;
    first_name: string;
    avatar_url: string;
  };
  stories: Story[];
}

const Video: React.FC<MyVideoProps> = ({ uri, style }) => {
  return (
    <ExpoVideo
      source={{ uri }}
      style={style}
      resizeMode={ResizeMode.COVER}
      useNativeControls
      isLooping
    />
  );
};

export default function MyProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useUser();

  // ✅ Correction: Vérifier tous les paramètres possibles
  const userId = params.userId || params.id || params.targetUserId;
  const numericUserId = userId ? Number(userId) : null;

  // ✅ Utiliser currentUser.id si aucun userId n'est passé en paramètre
  const targetUserId = numericUserId || currentUser?.id;

  console.log("Afficher les stories de l'utilisateur :", targetUserId);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentUserProfile = currentUser?.id === targetUserId;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState("");

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

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const rawUser = await apiFetch<any>(`users/${targetUserId}`, {
          auth: true,
        });
        const user: User = mapUserFromApi(rawUser);

        if (isCurrentUserProfile && currentUser) {
          user.profileVisibility = currentUser.profileVisibility;
        }

        setProfileUser(user);
      } catch (err) {
        console.error("[MyProfileScreen] fetch profile error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const userPosts: ApiPost[] = await apiFetch<ApiPost[]>(
          `posts?user_id=${targetUserId}`,
          { auth: true }
        );
        setPosts(userPosts);
      } catch (err) {
        console.error("[MyProfileScreen] fetch posts error:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    const fetchStories = async () => {
      try {
        setStoriesLoading(true);
        // ✅ Correction: Adapter au format de réponse de l'API
        const response: StoriesResponse[] = await apiFetch<StoriesResponse[]>(
          `stories?user_id=${targetUserId}`,
          { auth: true }
        );

        // Extraire les stories du premier utilisateur (normalement il n'y en a qu'un)
        const userStories = response.length > 0 ? response[0].stories : [];
        setStories(userStories || []);
      } catch (err) {
        console.error("[MyProfileScreen] fetch stories error:", err);
        setStories([]);
      } finally {
        setStoriesLoading(false);
      }
    };

    fetchProfile();
    fetchPosts();
    fetchStories();
  }, [targetUserId]);

  if (!targetUserId) {
    return (
      <View style={styles.centerContainer}>
        <Text>Utilisateur introuvable</Text>
      </View>
    );
  }

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
        uri: `https://ui-avatars.com/api/?name=${profileUser.first_name}&background=E24741&color=fff`,
      };

  return (
    <SafeAreaView style={styles.container}>
      <SocialHeader />

      {/* Toast */}
      <Animated.View style={[styles.toast, { top: 70, opacity: fadeAnim }]}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      {/* Profil utilisateur */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          onPress={() => {
            if (stories.length > 0) {
              console.log("Navigating to stories for user:", profileUser.id);
              router.push({
                pathname: "/screens/social/story/ViewStory",
                params: { userId: profileUser.id.toString() },
              });
            }
          }}
        >
          <View style={stories.length > 0 ? styles.storyRing : {}}>
            <Image source={avatarSource} style={styles.avatar} />
            {stories.length > 0 && (
              <View style={styles.storyIndicator}>
                <Text style={styles.storyIndicatorText}>{stories.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>{posts.length}</AppText>
            <AppText style={styles.statLabel}>Posts</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>
              {(profileUser.followers ?? []).length}
            </AppText>
            <AppText style={styles.statLabel}>Followers</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>
              {(profileUser.following ?? []).length}
            </AppText>
            <AppText style={styles.statLabel}>Following</AppText>
          </View>
        </View>
      </View>

      {/* Nom + Bio */}
      <View style={styles.bio}>
        <AppText style={styles.name}>
          {profileUser.first_name} {profileUser.last_name || ""}
        </AppText>
        {profileUser.bio && (
          <AppText style={styles.bioText}>{profileUser.bio}</AppText>
        )}
      </View>

      {/* Posts / Stories */}
      <View style={{ flex: 1 }}>
        {postsLoading ? (
          <ActivityIndicator
            size="small"
            color="#E24741"
            style={{ margin: 16 }}
          />
        ) : posts.length === 0 ? (
          <View style={styles.centerContainer}>
            <AppText style={styles.noPostsText}>No posts yet</AppText>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => {
              if (item.videos && item.videos.length > 0) {
                return (
                  <Video
                    uri={item.videos[0]?.url}
                    style={{ width: "33.33%", aspectRatio: 1 }}
                  />
                );
              }
              return (
                <Image
                  source={{ uri: item.photos?.[0]?.url }}
                  style={{
                    width: "33.33%",
                    aspectRatio: 1,
                    borderWidth: 0.5,
                    borderColor: "#fff",
                  }}
                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
