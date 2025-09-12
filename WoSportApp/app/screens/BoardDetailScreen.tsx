import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import {
  getSavedBoards,
  SavedBoard,
  SavedVideo,
  setItem,
} from "../../services/storage";

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [board, setBoard] = useState<SavedBoard | null>(null);
  const router = useRouter();

  const loadBoard = async () => {
    const boards = await getSavedBoards();
    const current = boards.find((b) => b.id === id);
    setBoard(current || null);
  };

  useEffect(() => {
    loadBoard();
  }, [id]);

  const removeVideoFromBoard = async (videoId: string) => {
    if (!board) return;
    Alert.alert("Supprimer", "Supprimer cette vidéo du tableau ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const updatedBoard: SavedBoard = {
            ...board,
            videos: board.videos.filter((v) => v.id !== videoId),
          };

          const boards = await getSavedBoards();
          const newBoards = boards.map((b) =>
            b.id === board.id ? updatedBoard : b
          );
          await setItem("savedBoards", JSON.stringify(newBoards));
          setBoard(updatedBoard);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedVideo }) => (
    <View style={styles.videoContainer}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          router.push(
            `/screens/VideoPlayerScreen?videoUrl=${encodeURIComponent(
              item.video_url
            )}&title=${encodeURIComponent(item.title)}`
          )
        }
      >
        <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
        <Text numberOfLines={1} style={styles.videoTitle}>
          {item.title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeVideoFromBoard(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="red" />
      </TouchableOpacity>
    </View>
  );

  if (!board) {
    return (
      <View style={styles.empty}>
        <Text>Aucun tableau trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>
      <Text style={styles.title}>{board.title}</Text>
      <FlatList
        data={board.videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 20,
    textAlign: "center",
  },
  videoContainer: {
    marginBottom: 16,
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: { width: "100%", height: 120, backgroundColor: "#ccc" },
  videoTitle: {
    fontSize: 14,
    fontWeight: "500",
    padding: 6,
  },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 4,
  },
});
