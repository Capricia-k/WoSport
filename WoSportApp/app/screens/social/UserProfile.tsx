import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../components/AppText";
import { FollowButton } from "../../../components/FollowButton";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";

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
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 40,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  gridContainer: { padding: 1, marginTop: 20 },
  postImage: {
    width: "33.33%",
    aspectRatio: 1,
    borderRadius: 8,
    margin: 1,
  },

  modernBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modernBtnText: {
    fontWeight: "600",
    fontSize: 16,
  },
});

const Video = ({ uri }: { uri: string }) => (
  <ExpoVideo
    source={{ uri }}
    style={styles.postImage}
    resizeMode={ResizeMode.COVER}
    useNativeControls
    isLooping
  />
);

export default function UserProfileScreen() {
  const { targetUserId } = useLocalSearchParams<{ targetUserId: string }>();
  const { currentUser } = useUser();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resUser = await fetch(
          `http://192.168.1.164:3000/api/v1/users/${targetUserId}`,
          { headers: { Authorization: `Bearer ${currentUser?.token}` } }
        );
        const u = await resUser.json();
        setProfileUser(u);

        const resPosts = await fetch(
          `http://192.168.1.164:3000/api/v1/posts?user_id=${targetUserId}`,
          { headers: { Authorization: `Bearer ${currentUser?.token}` } }
        );
        const p = await resPosts.json();
        setPosts(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (targetUserId) fetchData();
  }, [targetUserId]);

  if (loading)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );

  if (!profileUser)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Utilisateur introuvable</Text>
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
      <TouchableOpacity
        onPress={() =>
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
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profileUser.followers_count}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profileUser.following_count}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
      </View>

      {currentUser?.id !== profileUser.id && (
        <View style={styles.actions}>
          {/* Bouton Suivre */}
          <FollowButton
            targetUserId={profileUser.id}
            initialIsFollowing={profileUser.is_following}
            initialFollowId={profileUser.follow_id ?? null}
            initialFollowersCount={profileUser.followers_count}
            token={currentUser!.token}
            style={styles.modernBtn}
            textStyle={styles.modernBtnText}
          />

          {/* Bouton Message */}
          <TouchableOpacity
            style={[styles.modernBtn, { backgroundColor: "#f6f2e9" }]}
            onPress={() =>
              router.push({
                pathname: "./Chat",
                params: { targetUserId: profileUser.id.toString() },
              })
            }
          >
            <AppText style={[styles.modernBtnText, { color: "#333" }]}>
              Message
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {posts.length === 0 ? (
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
          renderItem={({ item }) =>
            item.videos?.length ? (
              <Video uri={item.videos[0].url} />
            ) : (
              <Image
                source={{ uri: item.photos?.[0]?.url }}
                style={styles.postImage}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
