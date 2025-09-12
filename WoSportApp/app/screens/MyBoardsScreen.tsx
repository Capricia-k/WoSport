import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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
import Header from "../../components/Header";
import {
  deleteBoard,
  getSavedBoards,
  SavedBoard,
  updateBoardTitle,
} from "../../services/storage";

export default function MyBoardsScreen() {
  const [boards, setBoards] = useState<SavedBoard[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<SavedBoard | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();

  const loadBoards = async () => {
    const saved = await getSavedBoards();
    setBoards(saved);
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleEditBoard = (board: SavedBoard) => {
    Alert.alert(
      "Modifier le tableau",
      `Que voulez-vous faire avec "${board.title}" ?`,
      [
        {
          text: "Renommer",
          onPress: () => {
            setSelectedBoard(board);
            setNewTitle(board.title);
            setIsModalVisible(true);
          },
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteBoard(board.id);
            loadBoards();
          },
        },
        { text: "Annuler", style: "cancel" },
      ]
    );
  };

  const getThumbnail = (video: {
    video_url: string;
    thumbnail_url?: string;
  }) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const fileName = video.video_url.split("/").pop()?.replace(".mp4", ".jpg");
    return fileName
      ? `https://res.cloudinary.com/dx16ewfq2/video/upload/w_300,h_200,c_fill/${fileName}`
      : "https://via.placeholder.com/300x200.png?text=No+Video";
  };

  const renderItem = ({ item }: { item: SavedBoard }) => {
    const video =
      item.videos && item.videos.length > 0
        ? { ...item.videos[0], thumbnail_url: getThumbnail(item.videos[0]) }
        : {
            thumbnail_url:
              "https://via.placeholder.com/300x200.png?text=No+Video",
          };

    return (
      <TouchableOpacity
        style={styles.boardContainer}
        onPress={() => router.push(`/screens/BoardDetailScreen?id=${item.id}`)}
      >
        <Image
          source={{ uri: video.thumbnail_url }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.boardFooter}>
          <Text style={styles.boardTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleEditBoard(item)}>
            <Ionicons name="create-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Renommer le tableau</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={async () => {
                  if (newTitle.trim() && selectedBoard) {
                    await updateBoardTitle(selectedBoard.id, newTitle.trim());
                    await loadBoards();
                  }
                  setIsModalVisible(false);
                  setSelectedBoard(null);
                }}
              >
                <Text style={styles.modalButtonText}>Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedBoard(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: "red" }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: "100%",
    height: 120,
  },
  boardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
