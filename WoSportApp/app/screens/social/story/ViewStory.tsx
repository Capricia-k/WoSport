// app/screens/social/story/[userId].tsx
import { Audio, Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  LongPressGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../components/AppText";
import ReactionList from "../../../../components/ReactionList";
import ReactionPicker from "../../../../components/ReactionPicker";
import StoryProgressBar from "../../../../components/StoryProgressBar";
import { useUser } from "../../../../context/UserContext";
import { API_BASE, apiFetch } from "../../../../services/api";
import { getItem } from "../../../../services/storage";

const { width, height } = Dimensions.get("window");
const IMAGE_DURATION = 5000;
const VIDEO_DURATION = 25000;

interface StoryMedia {
  url: string;
  content_type: string;
  filename: string;
}

interface Story {
  id: number;
  media: StoryMedia[];
  created_at: string;
  expires_at: string;
  user: {
    id: number;
    first_name: string;
    avatar_url: string;
  };
}

interface Reaction {
  id: number;
  reaction_type: string;
  user: {
    id: number;
    first_name: string;
    avatar_url: string;
  };
}

export default function StoryViewer() {
  const params = useLocalSearchParams() || {};
  const userIdParam = params.userId as string | undefined;
  const numericUserId = userIdParam ? Number(userIdParam) : null;
  const router = useRouter();
  const { currentUser } = useUser();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionList, setShowReactionList] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const videoRefs = useRef<{ [key: number]: ExpoVideo | null }>({});
  const replyInputRef = useRef<TextInput>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  useEffect(() => {
    if (!numericUserId) {
      console.log("numericUserId is null or undefined");
      setLoading(false);
      return;
    }

    console.log("Fetching stories for user:", numericUserId);

    const fetchStories = async () => {
      try {
        setLoading(true);

        const data: any[] = await apiFetch("stories", { auth: true });
        console.log("API response:", data);

        if (Array.isArray(data)) {
          const userStoriesData = data.find(
            (item) => item.user.id === numericUserId
          );

          if (userStoriesData) {
            setStories(userStoriesData.stories);

            if (userStoriesData.stories.length > 0) {
              fetchReactions(userStoriesData.stories[0].id);
            }
          } else {
            setStories([]);
          }
        } else {
          setStories([]);
        }
      } catch (err: any) {
        console.error("Erreur fetch stories:", err.message);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [numericUserId]);

  useEffect(() => {
    if (stories.length > 0 && currentIndex < stories.length) {
      fetchReactions(stories[currentIndex].id);
    }
  }, [currentIndex, stories]);

  const fetchReactions = async (storyId: number) => {
    try {
      const data: Reaction[] = await apiFetch(`stories/${storyId}/reactions`, {
        auth: true,
      });

      // DEBUG: Vérifiez les IDs en double
      console.log("🔍 Reactions data:", data);
      const ids = data.map((r) => r.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn("⚠️ Duplicate reaction IDs found:", duplicateIds);
      }

      setReactions(data);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setIsPaused(false);
      setShowReactionPicker(false);
      setShowReactionList(false);
    } else {
      router.back();
    }
  };

  const handlePreviousStory = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
      setIsPaused(false);
      setShowReactionPicker(false);
      setShowReactionList(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    const currentVideoRef = videoRefs.current[currentIndex];
    if (currentVideoRef) {
      if (isPaused) {
        currentVideoRef.playAsync();
      } else {
        currentVideoRef.pauseAsync();
      }
    }
  };

  const handleTap = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE && !showReactionPicker) {
      const tapX = nativeEvent.absoluteX;
      const screenWidth = width;

      if (tapX < screenWidth / 3) {
        handlePreviousStory();
      } else if (tapX > (screenWidth * 2) / 3) {
        handleNextStory();
      } else {
        togglePause();
      }
    }
  };

  const handleLongPress = () => {
    setShowReactionPicker(true);
    setIsPaused(true);
  };

  const handleReaction = async (reactionType: number) => {
    try {
      console.log("🔍 Reaction type received:", reactionType);

      const reactionTypeMap: { [key: number]: string } = {
        0: "like",
        1: "love",
        2: "laugh",
        3: "wow",
        4: "sad",
        5: "angry",
      };

      const reactionTypeString = reactionTypeMap[reactionType];

      if (!reactionTypeString) {
        console.error("❌ Invalid reaction type:", reactionType);
        return;
      }

      const currentStory = stories[currentIndex];
      const token = await getItem("userToken");

      if (!token) {
        console.error("❌ User not logged in");
        return;
      }

      const bodyData = { reaction_type: reactionTypeString };

      console.log("🔍 Request body:", JSON.stringify(bodyData));

      const response = await fetch(
        `${API_BASE}/stories/${currentStory.id}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      const responseText = await response.text();
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response text:", responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log("✅ Reaction added successfully:", responseData);

      setReactions((prev) => [...prev, responseData as Reaction]);
      setShowReactionPicker(false);
      setIsPaused(false);
    } catch (error) {
      console.error("❌ Error adding reaction:", error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentUser) return;

    setIsSendingReply(true);
    try {
      const currentStory = stories[currentIndex];

      await apiFetch(`users/${currentStory.user.id}/messages`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          content: `📱 Réponse à votre story: ${replyText}`,
        }),
      });

      setReplyText("");
      setShowReplyInput(false);
      alert("Réponse envoyée !");
    } catch (error: any) {
      console.error("Error sending reply:", error.message);
      alert("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSendingReply(false);
    }
  };

  const renderItem = ({ item, index }: { item: Story; index: number }) => {
    const mediaUrl = item.media[0]?.url;
    const isVideo = item.media[0]?.content_type?.startsWith("video/");

    if (!mediaUrl) {
      return (
        <View style={[styles.media, styles.center]}>
          <AppText style={{ color: "white" }}>Media non disponible</AppText>
        </View>
      );
    }

    if (isVideo) {
      return (
        <View style={styles.media}>
          <ExpoVideo
            ref={(ref) => {
              videoRefs.current[index] = ref;
            }}
            source={{ uri: mediaUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            useNativeControls={false}
            isLooping={false}
            shouldPlay={
              index === currentIndex && !isPaused && !showReactionPicker
            }
            onPlaybackStatusUpdate={(status) => {
              if (
                status.isLoaded &&
                status.didJustFinish &&
                index === currentIndex
              ) {
                handleNextStory();
              }
            }}
          />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: mediaUrl }}
        style={styles.media}
        resizeMode="cover"
      />
    );
  };

  if (!numericUserId) {
    return (
      <View style={styles.center}>
        <AppText style={{ color: "white" }}>Utilisateur introuvable</AppText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E24741" />
        <AppText style={{ color: "white", marginTop: 10 }}>
          Chargement...
        </AppText>
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.center}>
        <AppText
          style={{ color: "white", marginBottom: 20, textAlign: "center" }}
        >
          Aucune story disponible
        </AppText>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AppText style={styles.backButtonText}>Retour</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStory = stories[currentIndex];
  const handleOpenReactionPicker = () => {
    setShowReactionPicker(true);
    setIsPaused(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Bouton réaction en dehors du TapGestureHandler */}
        {!showReactionPicker && !showReplyInput && (
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={handleOpenReactionPicker}
          >
            <AppText style={styles.reactionButtonText}>😊</AppText>
          </TouchableOpacity>
        )}

        {/* Bouton liste des réactions en dehors du TapGestureHandler */}
        {reactions.length > 0 && !showReactionPicker && (
          <TouchableOpacity
            style={styles.reactionCountButton}
            onPress={() => setShowReactionList(true)}
          >
            <AppText style={styles.reactionCountText}>
              {reactions.length} ❤️
            </AppText>
          </TouchableOpacity>
        )}

        {/* Bouton réponse en dehors du TapGestureHandler */}
        {!showReactionPicker && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => setShowReplyInput(true)}
          >
            <AppText style={styles.replyText}>💬 Répondre</AppText>
          </TouchableOpacity>
        )}

        <LongPressGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              handleLongPress();
            }
            if (
              nativeEvent.state === State.END ||
              nativeEvent.state === State.CANCELLED
            ) {
              if (showReactionPicker) {
                setShowReactionPicker(false);
                setIsPaused(false);
              }
            }
          }}
        >
          <TapGestureHandler onHandlerStateChange={handleTap}>
            <View style={styles.container}>
              {/* Barres de progression */}
              <View style={styles.progressBarsContainer}>
                {stories.map((story, index) => {
                  const isVideoStory =
                    story.media[0]?.content_type?.startsWith("video/");
                  return (
                    <View key={story.id} style={styles.progressBarWrapper}>
                      <StoryProgressBar
                        duration={
                          isVideoStory ? VIDEO_DURATION : IMAGE_DURATION
                        }
                        onComplete={
                          index === currentIndex ? handleNextStory : undefined
                        }
                        isPaused={isPaused && index === currentIndex}
                        isActive={index === currentIndex}
                      />
                    </View>
                  );
                })}
              </View>

              {/* Stories */}
              <FlatList
                ref={flatListRef}
                data={stories}
                horizontal
                pagingEnabled
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(ev) => {
                  const index = Math.round(
                    ev.nativeEvent.contentOffset.x / width
                  );
                  setCurrentIndex(index);
                }}
                initialScrollIndex={0}
                scrollEnabled={false}
              />

              {/* Header avec infos utilisateur */}
              <View style={styles.header}>
                <Image
                  source={{ uri: currentStory.user.avatar_url }}
                  style={styles.avatar}
                />
                <AppText style={styles.username}>
                  {currentStory.user.first_name}
                </AppText>
                <AppText style={styles.time}>
                  {new Date(currentStory.created_at).toLocaleTimeString()}
                </AppText>
              </View>

              {/* Bouton fermeture */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <AppText style={styles.closeText}>✕</AppText>
              </TouchableOpacity>

              {/* Input de réponse */}
              {showReplyInput && (
                <View style={styles.replyContainer}>
                  <TextInput
                    ref={replyInputRef}
                    style={styles.replyInput}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Tapez votre réponse..."
                    placeholderTextColor="#999"
                    multiline
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendReply}
                    disabled={isSendingReply}
                  >
                    <AppText style={styles.sendText}>
                      {isSendingReply ? "..." : "➤"}
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Réactions */}
              <ReactionPicker
                visible={showReactionPicker}
                onReaction={handleReaction}
                onClose={() => {
                  setShowReactionPicker(false);
                  setIsPaused(false);
                }}
              />

              <ReactionList
                reactions={reactions}
                visible={showReactionList}
                onClose={() => setShowReactionList(false)}
              />
            </View>
          </TapGestureHandler>
        </LongPressGestureHandler>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  media: {
    width,
    height,
    backgroundColor: "#000",
  },
  progressBarsContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 4,
    zIndex: 20,
  },
  progressBarWrapper: {
    flex: 1,
    height: 3,
  },
  header: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 25,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  time: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    position: "absolute",
    top: 45,
    right: 16,
    zIndex: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  reactionCountButton: {
    position: "absolute",
    bottom: 180,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
  reactionCountText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  replyButton: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  replyText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 20,
    fontWeight: "bold",
  },
  replyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    zIndex: 1000,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 12,
    marginRight: 10,
    color: "#000",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#E24741",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  reactionButton: {
    position: "absolute",
    bottom: 120,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  reactionButtonText: {
    fontSize: 24,
  },
  backButton: {
    backgroundColor: "#E24741",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
