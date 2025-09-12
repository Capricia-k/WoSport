import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../../../components/AppText";
import { apiFetch } from "../../../../services/api";

const { width, height } = Dimensions.get("window");

interface Story {
  id: number;
  media_url: string;
  media_type: "video" | "image";
  content?: string;
  created_at: string;
}

export default function StoryViewer() {
  const params = useLocalSearchParams() || {}; // 🔹 toujours fallback
  const userIdParam = params.userId as string | undefined;
  const numericUserId = userIdParam ? Number(userIdParam) : null;
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!numericUserId) return;

    const fetchStories = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`stories?user_id=${numericUserId}`, {
          auth: true,
        });
        if (Array.isArray(data)) setStories(data);
        else console.warn("Stories invalides :", data);
      } catch (err: any) {
        console.error("Erreur fetch stories:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [numericUserId]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  const renderItem = ({ item }: { item: Story }) => {
    if (item.media_type === "video") {
      return (
        <ExpoVideo
          source={{ uri: item.media_url }}
          style={styles.media}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          isLooping
          shouldPlay
        />
      );
    }
    return <Image source={{ uri: item.media_url }} style={styles.media} />;
  };

  if (!numericUserId) {
    return (
      <View style={styles.center}>
        <AppText>Utilisateur introuvable</AppText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <AppText>Aucune story</AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleNextStory}
      >
        <FlatList
          ref={flatListRef}
          data={stories}
          horizontal
          pagingEnabled
          keyExtractor={(item) =>
            item.id?.toString() ?? Math.random().toString()
          }
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(ev) => {
            const index = Math.round(ev.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  media: { width, height },
});
