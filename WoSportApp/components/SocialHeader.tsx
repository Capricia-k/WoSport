import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useUser } from "../context/UserContext";
import { getUnreadMessagesCount } from "../services/api";

export default function SocialHeader() {
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
      {/* Colonne gauche */}
      <TouchableOpacity onPress={() => router.back()} style={styles.left}>
        <Ionicons name="chevron-back" size={28} color="#3c3c3c" />
      </TouchableOpacity>

      {/* Logo centré */}
      <TouchableOpacity
        onPress={() => router.push("/screens/social/SocialFeed")}
        style={styles.center}
      >
        <Image
          source={require("../assets/images/Logo_marron.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Colonne droite */}
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => router.push("/screens/social/SearchUser")}
        >
          <Ionicons name="search-outline" size={28} color="#3c3c3c" />
        </TouchableOpacity>
      </View>
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
    position: "relative",
  },
  left: {
    width: 40,
    alignItems: "flex-start",
  },
  center: {
    position: "absolute",
    left: "55%",
    transform: [{ translateX: -60 }],
  },
  logo: {
    width: 120,
    height: 60,
  },
  right: {
    width: 40,
    alignItems: "flex-end",
  },
  icon: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    backgroundColor: "#E24741",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
