// app/screens/social/AddStory.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";

const API_BASE = "http://192.168.1.164:3000/api/v1";

export default function AddStory() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [items, setItems] = useState<{ uri: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const photosPerm =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!photosPerm.granted)
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès aux photos/caméra."
        );
    })();
  }, []);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes option omise => tout est autorisé
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (res.canceled) return;

    const selected =
      res.assets?.map((a) => ({
        uri: a.uri,
        type: a.type === "video" ? "video/mp4" : "image/jpeg",
      })) ?? [];

    setItems((p) => [...p, ...selected]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Autorisez l'accès à la caméra pour continuer."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      // mediaTypes option omise => tout est autorisé
      quality: 1,
    });

    if (!result.canceled) {
      const newItems =
        result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === "image" ? "image/jpeg" : "video/mp4",
        })) ?? [];
      setItems((p) => [...p, ...newItems]);
    }
  };

  const upload = async () => {
    if (!currentUser || items.length === 0)
      return Alert.alert("Rien à envoyer");
    setLoading(true);
    try {
      const formData = new FormData();
      items.forEach((it, idx) => {
        const name = `story-${Date.now()}-${idx}.${
          it.type.includes("video") ? "mp4" : "jpg"
        }`;
        formData.append("story[media][]", {
          uri: it.uri.startsWith("file://") ? it.uri : "file://" + it.uri,
          name,
          type: it.type,
        } as any);
      });

      const res = await fetch(`${API_BASE}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          // Do NOT set Content-Type — fetch sets the multipart boundary automatically
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur upload: ${res.status} - ${text}`);
      }
      Alert.alert("OK", "Story publiée !");
      router.back();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        Alert.alert("Erreur", err.message);
      } else {
        Alert.alert("Erreur", "Upload échoué");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <SocialHeader />
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 12 }}>
          Nouvelle story
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <TouchableOpacity onPress={takePhoto} style={{ marginRight: 12 }}>
            <Text>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pick()}>
            <Text>🖼 Galerie</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal style={{ marginBottom: 12 }}>
          {items.map((it, i) => (
            <View key={i} style={{ marginRight: 8 }}>
              <Image
                source={{ uri: it.uri }}
                style={{ width: 120, height: 200, borderRadius: 8 }}
              />
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={upload}
          style={{
            backgroundColor: "#E24741",
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Publier la story</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
