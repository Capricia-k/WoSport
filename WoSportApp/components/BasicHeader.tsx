import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useUser } from "../context/UserContext";
import { getUnreadMessagesCount } from "../services/api";

export default function BasicHeader() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      if (!currentUser) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await getUnreadMessagesCount();
        if (mounted) setUnreadCount(res.unread_count ?? 0);
      } catch (err) {
        console.error("fetchUnread error", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 100000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  return (
    <View style={styles.header}>
      {/* Zone gauche */}
      <View style={styles.side}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#3c3c3c" />
        </TouchableOpacity>
      </View>

      {/* Zone centre (logo) */}
      <TouchableOpacity
        onPress={() => router.push("/screens/social/SocialFeed")}
        style={styles.center}
      >
        <Image
          source={require("../assets/images/wo-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Zone droite (placeholder vide pour équilibrer) */}
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F0E8",
    width: "100%",
  },
  side: {
    width: 40,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 50,
  },
});
