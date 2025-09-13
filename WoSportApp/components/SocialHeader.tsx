import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      {/* Bouton retour */}
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#3c3c3c" />
      </TouchableOpacity>

      {/* Logo centré */}
      <TouchableOpacity
        onPress={() => router.push("/screens/social/SocialFeed")}
      >
        <Image
          source={require("../assets/images/wo-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Icônes à droite */}
      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.icon}
          disabled={!currentUser}
          onPress={() => {
            if (!currentUser) return;
            router.push({
              pathname: "/screens/social/MyProfile",
              params: { targetUserId: currentUser.id.toString() },
            });
          }}
        >
          <Ionicons name="person-outline" size={24} color="#3c3c3c" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          disabled={!currentUser}
          onPress={() => {
            if (!currentUser) return;
            router.push("/screens/social/Inbox");
          }}
        >
          <Ionicons name="mail-outline" size={24} color="#3c3c3c" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#e4d9c3",
    width: "100%",
  },
  logo: {
    width: 120,
    height: 40,
    marginLeft: 64,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 20,
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
