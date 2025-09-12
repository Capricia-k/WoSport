import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { getSavedBoards, saveVideoInBoard } from "../../services/storage";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 15;

interface Workout {
  id: number;
  title: string;
  duration: number;
  level: string;
  video_url: string;
}

export default function WorkoutsScreen() {
  const [videos, setVideos] = useState<Workout[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("http://192.168.1.164:3000/workouts")
      .then((res) => res.json())
      .then((data: Workout[]) => {
        console.log("Workouts reçus:", data);
        setVideos(data);
      })
      .catch((err) => console.error("Erreur fetch workouts:", err));

    loadBoards();
  }, []);

  const loadBoards = async () => {
    const saved = await getSavedBoards();
    setBoards(saved);
  };

  const handleSaveVideo = (video: Workout) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const saveToBoard = async (boardId?: string) => {
    if (!selectedVideo) return;

    await saveVideoInBoard(selectedVideo, boardId, newBoardName);
    setModalVisible(false);
    setNewBoardName("");
    loadBoards();
    alert("Vidéo enregistrée !");
    router.push("/screens/MyBoardsScreen");
  };

  const renderItem = ({ item }: { item: Workout }) => {
    return (
      <View style={styles.videoWrapper}>
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/screens/VideoPlayerScreen?videoUrl=${encodeURIComponent(
                item.video_url
              )}&title=${encodeURIComponent(item.title)}`
            )
          }
        >
          <Video
            style={styles.video}
            source={{ uri: item.video_url }}
            resizeMode={ResizeMode.COVER}
            useNativeControls
          />
        </TouchableOpacity>

        <Text style={styles.duration}>{item.duration} min</Text>
        <Text style={styles.level}>{item.level}</Text>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => handleSaveVideo(item)}
        >
          <Ionicons name="bookmark-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>
      <Text style={styles.title}>All the workouts</Text>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}
      />

      {/* Modal de sélection du tableau */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enregistrer dans un tableau</Text>

            {boards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={styles.boardOption}
                onPress={() => saveToBoard(board.id)}
              >
                <Text>{board.title}</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              placeholder="Créer un nouveau tableau"
              value={newBoardName}
              onChangeText={setNewBoardName}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => saveToBoard(undefined)}
            >
              <Text style={{ color: "#fff" }}>Enregistrer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, color: "red" }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 30,
    textAlign: "center",
  },
  videoWrapper: { position: "relative", marginBottom: 15, width: ITEM_WIDTH },
  video: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  duration: { marginTop: 5, fontSize: 14 },
  level: { fontSize: 14, color: "#888" },
  saveButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  boardOption: {
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
