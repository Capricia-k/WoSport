import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  faCommentDots,
  faPaperPlane,
} from "@fortawesome/free-regular-svg-icons";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useFocusEffect } from "@react-navigation/native";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BottomNav from "../../../components/BottomNav";
import type { User } from "../../../services/api";
import { getFriends } from "../../../services/api";

import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
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

type FeedPost = ApiPost & { isEncouraged?: boolean };

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
  type: "image" | "video";
};

interface VideoItem {
  url: string;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying?: boolean;
  positionMillis?: number;
  durationMillis?: number;
}

// ================= VIDEO PLAYER (avec progress/seek/close) =================
const VideoWithProgress = ({
  video,
  isModal = false,
}: {
  video: VideoItem;
  isModal?: boolean;
}) => {
  const videoRef = useRef<Video>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getMediaSource = (url?: string) =>
    url
      ? url.startsWith("http")
        ? url
        : `${BASE_URL}${url}`
      : "https://via.placeholder.com/150";

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (
      status.isLoaded &&
      status.positionMillis !== undefined &&
      status.durationMillis !== undefined
    ) {
      setProgress(status.positionMillis / status.durationMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying || false);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) await videoRef.current.pauseAsync();
    else await videoRef.current.playAsync();
  };

  const seekBy = async (deltaMs: number) => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (
      status.isLoaded &&
      status.positionMillis !== undefined &&
      status.durationMillis !== undefined
    ) {
      const next = Math.max(
        0,
        Math.min(status.positionMillis + deltaMs, status.durationMillis)
      );
      await videoRef.current.setPositionAsync(next);
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={isModal ? styles.modalVideoContainer : styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: getMediaSource(video.url) }}
        style={isModal ? styles.modalMedia : styles.media}
        resizeMode={isModal ? ResizeMode.CONTAIN : ResizeMode.COVER}
        useNativeControls={!isModal}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        shouldPlay={isModal}
        isLooping
      />

      {isModal && (
        <>
          {/* Progress bar + times */}
          <View style={styles.progressContainer}>
            <View style={styles.customProgressContainer}>
              <View
                style={[
                  styles.customProgressBar,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(progress * duration)}
              </Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => seekBy(-10000)}
            >
              <Text style={styles.controlButtonText}>-10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.controlButtonText}>
                {isPlaying ? "❚❚" : "▶"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => seekBy(10000)}
            >
              <Text style={styles.controlButtonText}>+10s</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// ================= MAIN FEED =================
export default function SocialFeed() {
  const { currentUser } = useUser();
  const router = useRouter();

  const [posts, setPosts] = useState<FeedPost[]>([]);
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
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);

  const [expandedComments, setExpandedComments] = useState<
    Record<number, boolean>
  >({});

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const filteredActiveStories = activeStories.filter(
    (group: any) => group.user.id !== currentUser?.id
  );

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

  // ================= API CALLS =================
  const loadPosts = async (nextPage = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getPosts(nextPage);

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

      // ✅ Initialisation de encouragedByMe
      const initial: Record<number, boolean> = {};
      visiblePosts.forEach((p) => {
        // ton API renvoie peut-être p.is_encouraged ou similaire
        if ("is_encouraged" in p) {
          initial[p.id] = (p as any).is_encouraged;
        } else {
          initial[p.id] = false;
        }
      });
      const nextMap: Record<number, boolean> = {};
      visiblePosts.forEach((p: any) => {
        nextMap[p.id] =
          typeof p?.is_encouraged === "boolean" ? p.is_encouraged : false;
      });

      setEncouragedByMe((prev) => {
        const merged = { ...prev };
        Object.keys(nextMap).forEach((idStr) => {
          const id = Number(idStr);
          if (!(id in merged)) merged[id] = nextMap[id];
        });
        return merged;
      });

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
  useFocusEffect(
    React.useCallback(() => {
      const loadStories = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/stories`, {
            headers: { Authorization: `Bearer ${currentUser?.token}` },
          });
          if (!res.ok) throw new Error("Failed to load stories");
          const data = await res.json();
          setActiveStories(data);
        } catch (e) {
          console.error("[loadStories]", e);
        }
      };
      loadStories();
    }, [currentUser])
  );

  // ================= ACTIONS =================
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
      Alert.alert("Erreur", "Impossible d'ajouter le commentaire");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await deleteComment(postId, commentId);
      loadPosts(1);
    } catch (e) {
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

  const [encouragedByMe, setEncouragedByMe] = useState<Record<number, boolean>>(
    {}
  );
  const [encourageLoading, setEncourageLoading] = useState<
    Record<number, boolean>
  >({});
  const handleToggleEncourage = async (postId: number) => {
    if (encourageLoading[postId]) return;

    setEncourageLoading((prev) => ({ ...prev, [postId]: true }));

    const wasEncouraged = !!encouragedByMe[postId];

    // ✅ Optimistic update (icône + compteur)
    setEncouragedByMe((prev) => ({ ...prev, [postId]: !wasEncouraged }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              encouragements_count: Math.max(
                0,
                (p.encouragements_count || 0) + (wasEncouraged ? -1 : 1)
              ),
            }
          : p
      )
    );

    try {
      const data = await toggleEncouragement(postId);

      // ✅ API = source de vérité → overwrite
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, encouragements_count: data.encouragements_count }
            : p
        )
      );

      if (typeof (data as any).is_encouraged === "boolean") {
        setEncouragedByMe((prev) => ({
          ...prev,
          [postId]: (data as any).is_encouraged,
        }));
      }
    } catch (e) {
      // rollback si erreur
      setEncouragedByMe((prev) => ({ ...prev, [postId]: wasEncouraged }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                encouragements_count: Math.max(
                  0,
                  (p.encouragements_count || 0) + (wasEncouraged ? 1 : -1)
                ),
              }
            : p
        )
      );
      Alert.alert("Erreur", "Impossible d'encourager le post");
    } finally {
      setEncourageLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

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

  const viewStory = (story: Story) => {
    router.push({
      pathname: "/screens/social/story/ViewStory",
      params: {
        storyId: story.id.toString(),
        userId: story.user.id.toString(),
      },
    });
  };

  const openMediaModal = (post: FeedPost) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const renderMediaModal = () => {
    if (!selectedPost || !modalVisible) return null;

    const hasMedia =
      (selectedPost.photos?.length || 0) + (selectedPost.videos?.length || 0) >
      0;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            {hasMedia && (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.modalMediaContainer}
              >
                {selectedPost.photos?.map((p, idx) => (
                  <Image
                    key={`modal-photo-${idx}`}
                    source={{ uri: getMediaSource(p.url) }}
                    style={styles.modalMedia}
                    resizeMode="contain"
                  />
                ))}
                {selectedPost.videos?.map((v, idx) => (
                  <VideoWithProgress
                    key={`modal-video-${idx}`}
                    video={v}
                    isModal
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ================= POST RENDER =================

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return postDate.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: FeedPost }) => {
    const isEncouraged = !!encouragedByMe[item.id];
    const hasMedia =
      (item.photos?.length || 0) + (item.videos?.length || 0) > 0;

    if (!hasMedia) {
      // Post sans média - disposition normale
      return (
        <View style={styles.postContainer}>
          {/* HEADER NORMAL EN HAUT */}
          <View style={styles.postHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
                <Image
                  source={getPostAvatarSource(item.user)}
                  style={styles.postAvatar}
                />
              </TouchableOpacity>
              <View style={{ marginLeft: 10 }}>
                <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.userName}>{item.user.first_name}</Text>
                    {"is_verified" in item.user && item.user.is_verified && (
                      <Text style={styles.verifiedBadge}>✅</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <Text style={styles.postTime}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.postTitle}>{item.content}</Text>

          {/* Hashtags */}
          {item.content && item.content.includes("#") && (
            <View style={styles.hashtagContainer}>
              <Text style={styles.hashtagText}>
                {item.content
                  .split(" ")
                  .filter((word) => word.startsWith("#"))
                  .join(" ")}
              </Text>
            </View>
          )}

          {/* MÉTRIQUES EN LIGNE */}
          <View style={styles.metricsRow}>
            {/* Encouragement → biceps */}
            <TouchableOpacity
              style={styles.metricItem}
              onPress={() => handleToggleEncourage(item.id)}
              disabled={!!encourageLoading[item.id]}
            >
              <MaterialCommunityIcons
                name={isEncouraged ? "arm-flex" : "arm-flex-outline"}
                size={24}
                color="#9b5f2f"
              />
              <Text style={styles.metricCount}>
                {item.encouragements_count || 0}
              </Text>
            </TouchableOpacity>

            {/* Commentaires (toggle) */}
            <TouchableOpacity
              style={styles.metricItem}
              onPress={() => toggleComments(item.id)}
            >
              <FontAwesomeIcon icon={faCommentDots} size={22} color="#9b5f2f" />
              <Text style={styles.metricCount}>{item.comments_count || 0}</Text>
            </TouchableOpacity>

            {/* Partage */}
            <TouchableOpacity
              style={styles.metricItem}
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
              <FontAwesomeIcon icon={faShare} size={18} color="#9b5f2f" />
            </TouchableOpacity>
          </View>

          {/* COMMENTS (repliables) */}
          {expandedComments[item.id] &&
            item.comments?.map((c) => {
              if (!c.user) return null;
              const canDelete =
                currentUser?.id === c.user.id ||
                currentUser?.id === item.user.id;

              return (
                <View key={c.id} style={styles.commentRow}>
                  <Pressable onPress={() => goToProfile(c.user?.id)}>
                    <Image
                      source={getPostAvatarSource(c.user)}
                      style={styles.commentAvatar}
                    />
                  </Pressable>

                  <View style={styles.commentContent}>
                    <Text style={styles.commentName}>
                      {c.user.first_name ?? "User"}
                    </Text>
                    <Text style={styles.comment}>{c.body}</Text>
                  </View>

                  {canDelete && (
                    <Pressable
                      onPress={() =>
                        confirmDeleteComment(
                          item.id,
                          c.id,
                          c.user?.first_name ?? "User"
                        )
                      }
                      style={styles.deleteCommentButton}
                    >
                      <Text style={styles.deleteCommentText}>×</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}

          {/* COMMENT INPUT (repliable) */}
          {expandedComments[item.id] && (
            <View style={styles.commentInputContainer}>
              <TextInput
                placeholder="Add a comment..."
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
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  size={22}
                  color="#9b5f2f"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // Post avec média - disposition spéciale
    return (
      <View style={styles.postContainer}>
        <View style={styles.postContent}>
          {/* MÉDIA À GAUCHE */}
          <View style={styles.mediaContainer}>
            <TouchableOpacity onPress={() => openMediaModal(item)}>
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
            </TouchableOpacity>
          </View>

          {/* CONTENU À DROITE */}
          <View style={styles.rightContent}>
            {/* HEADER À DROITE */}
            <View style={styles.postHeaderRight}>
              <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
                <Image
                  source={getPostAvatarSource(item.user)}
                  style={styles.postAvatar}
                />
              </TouchableOpacity>
              <View style={{ marginLeft: 10 }}>
                <TouchableOpacity onPress={() => goToProfile(item.user.id)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.userName}>{item.user.first_name}</Text>
                    {"is_verified" in item.user && item.user.is_verified && (
                      <Text style={styles.verifiedBadge}>✅</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.postTime}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              </View>
            </View>

            {/* TEXTE DU POST */}
            <Text style={styles.postTitle}>{item.content}</Text>

            {/* Hashtags */}
            {item.content && item.content.includes("#") && (
              <View style={styles.hashtagContainer}>
                <Text style={styles.hashtagText}>
                  {item.content
                    .split(" ")
                    .filter((word) => word.startsWith("#"))
                    .join(" ")}
                </Text>
              </View>
            )}

            {/* MÉTRIQUES EN DESSOUS */}
            <View style={styles.mediaMetrics}>
              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => handleToggleEncourage(item.id)}
                disabled={!!encourageLoading[item.id]}
              >
                <MaterialCommunityIcons
                  name={isEncouraged ? "arm-flex" : "arm-flex-outline"}
                  size={26}
                  color="#9b5f2f"
                />
                <Text style={styles.metricCount}>
                  {item.encouragements_count || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => toggleComments(item.id)}
              >
                <FontAwesomeIcon
                  icon={faCommentDots}
                  size={22}
                  color="#9b5f2f"
                />
                <Text style={styles.metricCount}>
                  {item.comments_count || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricItem}
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
                <FontAwesomeIcon icon={faShare} size={22} color="#9b5f2f" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* COMMENTS (repliables) */}
        {expandedComments[item.id] &&
          item.comments?.map((c) => {
            if (!c.user) return null;
            const canDelete =
              currentUser?.id === c.user.id || currentUser?.id === item.user.id;

            const longPressGesture = Gesture.LongPress()
              .minDuration(500)
              .onStart(() => {
                if (canDelete) {
                  confirmDeleteComment(
                    item.id,
                    c.id,
                    c.user?.first_name ?? "User"
                  );
                }
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
                  <View style={styles.commentContent}>
                    <Text style={styles.commentName}>
                      {c.user?.first_name ?? "User"}
                    </Text>
                    <Text style={styles.comment}>{c.body}</Text>
                  </View>

                  {canDelete && (
                    <Pressable
                      onPress={() =>
                        confirmDeleteComment(
                          item.id,
                          c.id,
                          c.user?.first_name ?? "User"
                        )
                      }
                      style={styles.deleteCommentButton}
                    >
                      <Text style={styles.deleteCommentText}>×</Text>
                    </Pressable>
                  )}
                </View>
              </GestureDetector>
            );
          })}

        {/* COMMENT INPUT (repliable) */}
        {expandedComments[item.id] && (
          <View style={styles.commentContainer}>
            <TextInput
              placeholder="Add a comment..."
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
              <FontAwesomeIcon icon={faPaperPlane} size={18} color="#9b5f2f" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <SocialHeader />

        {/* ✅ Une seule FlatList : stories en header, posts en items */}
        <FlatList
          data={posts}
          keyExtractor={(item) => `post-${item.id}`}
          renderItem={renderPost}
          onEndReached={() => loadPosts(page + 1)}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.postsContainer}
          style={{ flex: 1 }}
          ListHeaderComponent={
            <View style={styles.storiesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.storiesContent}
              >
                {/* Votre story */}
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
                      <Text style={styles.addIconText}>+</Text>
                    </View>
                  </View>
                  <Text style={styles.storyLabel}>Your story</Text>
                </TouchableOpacity>

                {/* Stories des amis */}
                {filteredActiveStories.map((group: any) => {
                  const longPressGesture = Gesture.LongPress()
                    .minDuration(500)
                    .onStart(() => goToProfile(group.user.id));

                  return (
                    <GestureDetector
                      key={group.user.id}
                      gesture={longPressGesture}
                    >
                      <TouchableOpacity
                        style={styles.storyWrapper}
                        onPress={() =>
                          router.push({
                            pathname: "/screens/social/story/ViewStory",
                            params: {
                              storyId: group.stories[0].id.toString(),
                              userId: group.user.id.toString(),
                            },
                          })
                        }
                      >
                        {filteredActiveStories.map((group: any) => {
                          const longPressGesture = Gesture.LongPress()
                            .minDuration(500)
                            .onStart(() => goToProfile(group.user.id));

                          const hasUnviewed = group.hasUnviewed;

                          return (
                            <GestureDetector
                              key={group.user.id}
                              gesture={longPressGesture}
                            >
                              <TouchableOpacity
                                style={styles.storyWrapper}
                                onPress={() =>
                                  router.push({
                                    pathname: "/screens/social/story/ViewStory",
                                    params: {
                                      storyId: group.stories[0].id.toString(),
                                      userId: group.user.id.toString(),
                                    },
                                  })
                                }
                              >
                                {hasUnviewed ? (
                                  <LinearGradient
                                    colors={["#D9B98C", "#feda75", "#fa7e1e"]}
                                    style={{
                                      borderRadius: 40,
                                      padding: 3,
                                    }}
                                  >
                                    <Image
                                      source={getPostAvatarSource(group.user)}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                        borderWidth: 2,
                                        borderColor: "white",
                                      }}
                                    />
                                  </LinearGradient>
                                ) : (
                                  <View
                                    style={{
                                      borderRadius: 40,
                                      padding: 3,
                                      borderWidth: 2,
                                      borderColor: "#d3d3d3",
                                    }}
                                  >
                                    <Image
                                      source={getPostAvatarSource(group.user)}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                      }}
                                    />
                                  </View>
                                )}

                                <Text style={styles.storyLabel}>
                                  {group.user.first_name}
                                </Text>
                              </TouchableOpacity>
                            </GestureDetector>
                          );
                        })}
                      </TouchableOpacity>
                    </GestureDetector>
                  );
                })}

                {/* Amis sans stories */}
                {friends
                  .filter(
                    (friend) =>
                      !activeStories.some(
                        (story: any) => story.user.id === friend.id
                      )
                  )
                  .map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      style={styles.storyWrapper}
                      onPress={() => goToProfile(friend.id)}
                    >
                      <Image
                        source={getPostAvatarSource(friend)}
                        style={[styles.storyAvatar, { opacity: 0.6 }]}
                      />
                      <Text style={[styles.storyLabel, { opacity: 0.6 }]}>
                        {friend.first_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          }
        />

        {/* BOTTOM NAVIGATION */}
        <BottomNav onMiddlePress={() => setInputVisible((prev) => !prev)} />

        {/* MEDIA PREVIEW + INPUT */}
        {inputVisible && (
          <View style={styles.inputContainer}>
            <View style={styles.visibilityRow}>
              {/* Public + Privé */}
              <View style={styles.visibilityContainer}>
                <TouchableOpacity
                  onPress={() => setPostVisibility("public")}
                  style={styles.visibilityButton}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      postVisibility === "public" && styles.visibilityActive,
                    ]}
                  >
                    🌐 Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPostVisibility("private")}
                  style={styles.visibilityButton}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      postVisibility === "private" && styles.visibilityActive,
                    ]}
                  >
                    🔒 Privé
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Croix */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setInputVisible(false)}
              >
                <Text style={styles.cancelText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {selectedMedia.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaPreviewContainer}
              >
                {selectedMedia.map((media, idx) => (
                  <View key={idx} style={styles.mediaPreviewItem}>
                    {media.type.startsWith("image") ? (
                      <Image
                        source={{ uri: media.uri }}
                        style={styles.previewMedia}
                      />
                    ) : (
                      <Video
                        source={{ uri: media.uri }}
                        style={styles.previewMedia}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls
                        shouldPlay={false}
                        isLooping
                      />
                    )}
                    <TouchableOpacity
                      style={styles.mediaDeleteButton}
                      onPress={() =>
                        setSelectedMedia((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Share your progress..."
                style={styles.newPostInput}
                value={newPostText}
                onChangeText={setNewPostText}
              />

              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <Text style={styles.mediaButtonText}>📎</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newPostButton}
                onPress={handleAddPost}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {renderMediaModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
