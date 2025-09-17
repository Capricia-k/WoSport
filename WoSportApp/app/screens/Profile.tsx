import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../../components/AppText";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import SocialPosts from "../screens/social/SocialPosts";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, updateAvatar } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "posts">("overview");

  // ✅ si pas connecté → message clair
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppText style={{ textAlign: "center", marginTop: 50 }}>
          You must be logged in to view your profile.
        </AppText>
      </View>
    );
  }

  // --- PICK AND UPLOAD AVATAR ---
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!asset.uri) return;

      try {
        const newAvatarUrl = await uploadAvatarFile(asset.uri);
        await updateAvatar(newAvatarUrl);
        Alert.alert("Success", "Avatar updated successfully!");
      } catch (err: any) {
        console.error("[ProfileScreen] Failed to update avatar:", err);
        Alert.alert("Error", err.message || "Failed to upload avatar.");
      }
    }
  };

  // --- UPLOAD AVATAR FILE ---
  const uploadAvatarFile = async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append("user[avatar]", {
      uri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as unknown as Blob);

    const res = await fetch(
      `http://192.168.1.164:3000/api/v1/users/${currentUser.id}/avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to upload avatar: ${errorText}`);
    }

    const data = await res.json();
    if (!data.avatar_url) throw new Error("No avatar_url returned from server");
    return data.avatar_url;
  };

  // --- AVATAR SOURCE ---
  const avatarSource = currentUser.avatar_url
    ? { uri: currentUser.avatar_url }
    : {
        uri: `https://ui-avatars.com/api/?name=${currentUser.first_name}&background=9b5f2f&color=fff`,
      };

  return (
    <View style={styles.container}>
      <Header />

      {/* Avatar + infos utilisateur */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrapper}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.cameraIcon}>
            <AppText style={styles.cameraText}>📷</AppText>
          </View>
        </TouchableOpacity>

        <AppText style={styles.name}>{currentUser.first_name}</AppText>
        <AppText style={styles.plan}>Premium plan</AppText>
      </View>

      {/* Onglets */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <AppText
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <AppText
            style={[
              styles.tabText,
              activeTab === "posts" && styles.activeTabText,
            ]}
          >
            Posts
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
      >
        {activeTab === "overview" ? (
          <>
            <View style={styles.statsContainer}>
              {[
                { label: "Workouts completed", value: 120 },
                { label: "Calories tracked", value: 45300 },
                { label: "Challenges won", value: 8 },
              ].map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <AppText style={styles.statNumber}>{stat.value}</AppText>
                  <AppText>{stat.label}</AppText>
                </View>
              ))}
            </View>

            {/* Boutons de navigation */}
            {["Edit Profile", "Cycle Info", "Badges"].map((btn) => (
              <TouchableOpacity
                key={btn}
                style={styles.button}
                onPress={() => {
                  if (btn === "Edit Profile")
                    router.push("/screens/EditProfile");
                }}
              >
                <AppText style={styles.buttonText}>{btn}</AppText>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <SocialPosts
            userId={currentUser.id}
            token={currentUser.token}
            onPressPost={(postId: number) =>
              router.push(`./screens/SocialFeed?postId=${postId}`)
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f3ea", paddingTop: 50 },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E24741",
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cameraText: { fontSize: 16 },
  name: { fontSize: 22, fontWeight: "bold" },
  plan: { color: "#9b5f2f", marginBottom: 20 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#E24741" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#777" },
  activeTabText: { color: "#E24741" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f0eee6",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  button: {
    width: width * 0.9,
    height: 60,
    padding: 12,
    borderWidth: 2,
    borderColor: "#E24741",
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#F5F0E8",
    alignSelf: "center",
  },
  buttonText: { color: "#333232", fontSize: 20, fontWeight: "bold" },
});
