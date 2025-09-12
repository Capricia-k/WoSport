import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

interface Post {
  id: number;
  photos: { url: string }[];
  videos: { url: string }[];
  content?: string;
}

interface ProfileUser {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  follow_id?: number | null;
}

const Video: React.FC<{ uri: string }> = ({ uri }) => (
  <ExpoVideo
    source={{ uri }}
    style={styles.gridImage}
    useNativeControls
    resizeMode={ResizeMode.COVER}
    isLooping
  />
);

export default function UserProfile() {
  const { targetUserId } = useLocalSearchParams<{ targetUserId: string }>();
  const { currentUser } = useUser();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!currentUser || !targetUserId) return;

    try {
      setLoading(true);

      // Fetch profil
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/users/${targetUserId}`,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch user profile");
      const userData: ProfileUser = await res.json();
      setProfileUser(userData);

      // Fetch posts
      const postsRes = await fetch(
        `http://192.168.1.164:3000/api/v1/posts?user_id=${targetUserId}`,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      if (postsRes.ok) {
        const postsData: Post[] = await postsRes.json();
        setPosts(postsData);
      }
    } catch (err) {
      console.error("[UserProfile] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#E24741" />
    );
  if (!profileUser) return null;

  const avatarSource = profileUser.avatar_url
    ? { uri: profileUser.avatar_url }
    : {
        uri: `https://ui-avatars.com/api/?name=${profileUser.first_name}&background=E24741&color=fff`,
      };

  const renderPost = ({ item }: { item: Post }) => {
    if (item.photos && item.photos.length > 0) {
      return (
        <Image source={{ uri: item.photos[0].url }} style={styles.gridImage} />
      );
    } else if (item.videos && item.videos.length > 0) {
      return <Video uri={item.videos[0].url} />;
    } else {
      return (
        <View
          style={[
            styles.gridImage,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#eee",
              padding: 4,
            },
          ]}
        >
          <Text style={{ textAlign: "center" }} numberOfLines={3}>
            {item.content || "Texte"}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <SocialHeader />
      </SafeAreaView>

      {/* User Info */}
      <View style={styles.profileHeader}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>{posts.length}</AppText>
            <AppText>Posts</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>
              {profileUser.followers_count || 0}
            </AppText>
            <AppText>Followers</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText style={styles.statNumber}>
              {profileUser.following_count || 0}
            </AppText>
            <AppText>Following</AppText>
          </View>
        </View>
      </View>

      {/* Username + Bio */}
      <View style={styles.bio}>
        <AppText style={styles.name}>
          {profileUser.first_name} {profileUser.last_name}
        </AppText>
        {profileUser.bio && (
          <AppText style={styles.bioText}>{profileUser.bio}</AppText>
        )}
      </View>

      {/* Follow / Message */}
      {currentUser?.id !== profileUser.id && (
        <View style={styles.actions}>
          {/* Follow Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: profileUser.is_following
                  ? "#E24741"
                  : "#4CAF50",
              },
            ]}
          >
            <FollowButton
              targetUserId={profileUser.id}
              initialIsFollowing={profileUser.is_following}
              initialFollowId={profileUser.follow_id ?? null}
              initialFollowersCount={profileUser.followers_count}
              token={currentUser!.token}
            />
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: profileUser.is_following
                  ? "#f6f2e9"
                  : "#4CAF50",
              },
            ]}
          >
            <AppText style={[styles.actionText, { color: "#000" }]}>
              Message
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts Grid */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={renderPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  stats: { flexDirection: "row", flex: 1, justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  bio: { paddingHorizontal: 16, marginBottom: 10 },
  name: { fontWeight: "bold", fontSize: 16 },
  bioText: { marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontWeight: "600" },
  gridImage: {
    width: "33%",
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: "#fff",
  },
});
