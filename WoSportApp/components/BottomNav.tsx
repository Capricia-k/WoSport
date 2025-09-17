import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../context/UserContext";
import { getUnreadMessagesCount } from "../services/api";

export default function BottomNav({
  onMiddlePress,
}: {
  onMiddlePress: () => void;
}) {
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          router.push({
            pathname: "/screens/Home",
            params: { targetUserId: currentUser?.id.toString() },
          });
        }}
      >
        <FontAwesome name="home" size={22} color="#9b5f2f" />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          router.push({
            pathname: "/screens/WorkoutsScreen",
            params: { targetUserId: currentUser?.id.toString() },
          });
        }}
      >
        <FontAwesome5 name="dumbbell" size={22} color="#9b5f2f" />
        <Text style={styles.label}>Workout</Text>
      </TouchableOpacity>

      {/* Bouton central */}
      <TouchableOpacity style={styles.middleButton} onPress={onMiddlePress}>
        <FontAwesome name="plus" size={26} color="#9b5f2f" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        disabled={!currentUser}
        onPress={() => {
          if (!currentUser) return;
          router.push("/screens/social/Inbox");
        }}
      >
        <FontAwesome name="comments" size={22} color="#9b5f2f" />

        <Text style={styles.label}>Community</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          router.push({
            pathname: "/screens/social/MyProfile",
            params: { targetUserId: currentUser?.id.toString() },
          });
        }}
      >
        <FontAwesome name="user" size={22} color="#9b5f2f" />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5F0E8",
    paddingVertical: 0,
    borderTopWidth: 2,
    borderColor: "#c4b89f",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#9b5f2f",
    marginTop: 2,
  },
  middleButton: {
    backgroundColor: "#F5F0E8",
    borderRadius: 40,
    padding: 10,
    width: 45,
    height: 47,
    marginTop: 8,
    marginLeft: 10,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#9b5f2f",
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
