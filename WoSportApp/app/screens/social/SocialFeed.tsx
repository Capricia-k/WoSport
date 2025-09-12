import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { User } from "../../../services/api";
import { getFriends } from "../../../services/api";

import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";
import {
  addComment,
  ApiPost,
  createPost,
  deleteComment,
  getPosts,
  toggleEncouragement,
  Visibility,
} from "../../../services/api";
import { styles } from "../../../styles/SocialFeed.styles";

const BASE_URL = "http://192.168.1.164:3000";

type Story = {
  id: number;
  user: {
    id: number;
    first_name: string;
    avatar_url?: string;
    followers?: number[];
  };
  mediaUrl: string;
  createdAt: string;
};

export default function SocialFeed() {
  const { currentUser } = useUser();
  const router = useRouter();

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<
    { uri: string; type: string; fileName?: string }[]
  >([]);
  const [newPostText, setNewPostText] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [postVisibility, setPostVisibility] = useState<Visibility>("public");
  const [friends, setFriends] = useState<User[]>([]);
  const [activeStories, setActiveStories] = useState<any[]>([]);

  const getMediaSource = (url?: string) =>
    url
      ? url.startsWith("http")
        ? url
        : `${BASE_URL}${url}`
      : "https://via.placeholder.com/150";

  const getPostAvatarSource = (
    user?: { id: number; first_name: string; avatar_url?: string } | null
  ) => {
    if (!user?.first_name)
      return {
        uri: "https://ui-avatars.com/api/?name=User&background=E24741&color=fff",
      };
    return user.avatar_url
      ? { uri: getMediaSource(user.avatar_url) }
      : {
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.first_name
          )}&background=E24741&color=fff`,
        };
  };

  const goToProfile = (userId?: number) => {
    if (!userId || !currentUser) return;
    if (userId === currentUser.id) router.push("/screens/social/MyProfile");
    else router.push(`/screens/social/UserProfile?targetUserId=${userId}`);
  };

  // Chargement des posts avec filtrage
  const loadPosts = async (nextPage = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getPosts(nextPage);
      console.log("[Posts reçus]", data);

      const visiblePosts = data.filter((post) => {
        if (post.visibility === "public") return true;
        if (post.visibility === "private")
          return post.user.id === currentUser?.id;
        if (post.visibility === "friends") {
          return currentUser && post.user.followers?.includes(currentUser.id);
        }
        return false;
      });

      setPosts((prev) =>
        nextPage === 1
          ? visiblePosts
          : [
              ...prev,
              ...visiblePosts.filter((p) => !prev.some((x) => x.id === p.id)),
            ]
      );
      setPage(nextPage);
    } catch (e) {
      console.error("[loadPosts]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Load friends
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (e) {
        console.error("[loadFriends]", e);
      }
    };
    loadFriends();
  }, []);

  // Load active stories
  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/stories`, {
          headers: { Authorization: `Bearer ${currentUser?.token}` },
        });
        if (!res.ok) throw new Error("Failed to load stories");
        const data = await res.json(); // { user, stories: [] }
        setActiveStories(data);
      } catch (e) {
        console.error("[loadStories]", e);
      }
    };
    loadStories();
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(
        result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === "image" ? "image/jpeg" : "video/mp4",
          fileName: asset.fileName ?? undefined,
        }))
      );
    }
  };

  const handleAddPost = async () => {
    if (!newPostText.trim() && selectedMedia.length === 0) return;
    try {
      const created = await createPost(
        newPostText.trim(),
        selectedMedia,
        postVisibility
      );
      setNewPostText("");
      setSelectedMedia([]);
      setPostVisibility("public");
      setPosts((prev) => [created, ...prev]);
    } catch (e) {
      console.error("[handleAddPost]", e);
      Alert.alert("Erreur", "Impossible de créer le post");
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    try {
      await addComment(postId, text.trim());
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      loadPosts(1);
    } catch (e) {
      console.error("[handleAddComment]", e);
      Alert.alert("Erreur", "Impossible d'ajouter le commentaire");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(postId, commentId);
      loadPosts(1);
    } catch (e) {
      console.error("[handleDeleteComment]", e);
      Alert.alert("Erreur", "Impossible de supprimer le commentaire");
    }
  };

  const confirmDeleteComment = (
    postId: number,
    commentId: number,
    userName: string
  ) => {
    Alert.alert(
      "Supprimer le commentaire",
      `Voulez-vous vraiment supprimer le commentaire de ${userName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => handleDeleteComment(postId, commentId),
        },
      ]
    );
  };

  const handleToggleEncourage = async (postId: number) => {
    try {
      const data = await toggleEncouragement(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, encouragements_count: data.encouragements_count }
            : p
        )
      );
    } catch (e) {
      console.error("[handleToggleEncourage]", e);
      Alert.alert("Erreur", "Impossible d'encourager le post");
    }
  };

  const viewStory = (story: Story) =>
    router.push(`../ViewStory?storyId=${story.id}`);

  const renderPost = ({ item }: { item: ApiPost }) => {
    const hasMedia =
      (item.photos?.length || 0) + (item.videos?.length || 0) > 0;

    return (
      <View style={styles.postContainer}>
        {/* HEADER */}
        <View style={styles.postHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
              <Image
                source={getPostAvatarSource(item.user)}
                style={styles.postAvatar}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
              <Text style={styles.userName}>{item.user.first_name}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.content}</Text>

        {/* MEDIA */}
        {hasMedia && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {item.photos?.map((p, idx) => (
              <Image
                key={`photo-${idx}`}
                source={{ uri: getMediaSource(p.url) }}
                style={styles.media}
              />
            ))}
            {item.videos?.map((v, idx) => (
              <Video
                key={`video-${idx}`}
                source={{ uri: getMediaSource(v.url) }}
                style={styles.media}
                resizeMode={ResizeMode.COVER}
                useNativeControls
                shouldPlay={false}
                isLooping
              />
            ))}
          </ScrollView>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleToggleEncourage(item.id)}>
            <Text style={styles.actionText}>
              💪 {item.encouragements_count}
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionText}>💬 {item.comments_count}</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "../social/SelectUser",
                params: {
                  targetUserId: item.user.id.toString(),
                  targetUserName: item.user.first_name,
                  forwardedPost: JSON.stringify(item),
                },
              })
            }
          >
            <Text style={styles.actionText}>✉️</Text>
          </TouchableOpacity>
        </View>

        {/* COMMENTS */}
        {item.comments?.map((c) => {
          const longPressGesture = Gesture.LongPress()
            .minDuration(500)
            .onStart(() => {
              if (currentUser && c.user?.id === currentUser.id)
                confirmDeleteComment(
                  item.id,
                  c.id,
                  c.user?.first_name ?? "User"
                );
            });

          return (
            <GestureDetector key={c.id} gesture={longPressGesture}>
              <View style={styles.commentRow}>
                <TouchableOpacity onPress={() => goToProfile(c.user?.id)}>
                  <Image
                    source={getPostAvatarSource(c.user)}
                    style={styles.commentAvatar}
                  />
                </TouchableOpacity>
                <Text style={styles.commentName}>
                  {c.user?.first_name ?? "User"}
                </Text>
                <Text style={styles.comment}>{c.body}</Text>
              </View>
            </GestureDetector>
          );
        })}

        {/* COMMENT INPUT */}
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <SocialHeader />

      {/* STORIES */}
      <View style={{ marginVertical: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            alignItems: "center",
          }}
        >
          {/* add story */}
          <TouchableOpacity
            style={styles.storyWrapper}
            onPress={() => router.push("../social/AddStory")}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={getPostAvatarSource(currentUser)}
                style={styles.storyAvatar}
              />
              <View style={styles.addIcon}>
                <Text style={{ fontWeight: "700" }}>+</Text>
              </View>
            </View>
            <Text style={styles.storyLabel}>Your story</Text>
          </TouchableOpacity>

          {/* active stories */}
          {activeStories.map((group: any) => (
            <TouchableOpacity
              key={group.user.id}
              style={styles.storyWrapper}
              onPress={() =>
                router.push({
                  pathname: "../social/ViewStory",
                  params: { storyId: group.stories[0].id.toString() },
                })
              }
            >
              <Image
                source={getPostAvatarSource(group.user)}
                style={styles.storyAvatar}
              />
              <Text style={styles.storyLabel}>{group.user.first_name}</Text>
            </TouchableOpacity>
          ))}

          {/* friends */}
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.storyWrapper}
              onPress={() => goToProfile(friend.id)}
            >
              <Image
                source={getPostAvatarSource(friend)}
                style={styles.storyAvatar}
              />
              <Text style={styles.storyLabel}>{friend.first_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* POSTS */}
      <FlatList
        data={posts}
        keyExtractor={(item) => `post-${item.id}`}
        renderItem={renderPost}
        onEndReached={() => loadPosts(page + 1)}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* MEDIA PREVIEW + INPUT */}
      <View
        style={{
          padding: 12,
          backgroundColor: "#F5EFE1",
          borderTopWidth: 1,
          borderTopColor: "#ddd",
        }}
      >
        {/* Visibility */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => setPostVisibility("public")}
            style={{ marginRight: 10 }}
          >
            <Text
              style={{
                color: postVisibility === "public" ? "#5C00DF" : "#888",
              }}
            >
              🌐 Public
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPostVisibility("private")}>
            <Text
              style={{
                color: postVisibility === "private" ? "#5C00DF" : "#888",
              }}
            >
              🔒 Privé
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {selectedMedia.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {selectedMedia.map((media, idx) => (
              <View key={idx} style={styles.mediaPreviewItem}>
                {media.type.startsWith("image") ? (
                  <Image source={{ uri: media.uri }} style={{ flex: 1 }} />
                ) : (
                  <Video
                    source={{ uri: media.uri }}
                    style={{ flex: 1 }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay={false}
                    isLooping
                  />
                )}
                <TouchableOpacity
                  style={styles.mediaDeleteButton}
                  onPress={() =>
                    setSelectedMedia((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Row input */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Share your progress..."
            style={[styles.newPostInput, { flex: 1 }]}
            value={newPostText}
            onChangeText={setNewPostText}
          />
          <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
            <Text style={{ fontSize: 18 }}>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={handleAddPost}
          >
            <Text style={{ color: "#fff" }}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
