import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoPlayerScreen() {
  const { videoUrl, title } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5EFE1" }}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </SafeAreaView>

      {/* Vidéo en plein écran */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUrl as string }}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        shouldPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F0E8",
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "600", flexShrink: 1 },
  video: {
    flex: 1,
    backgroundColor: "#000",
  },
});
