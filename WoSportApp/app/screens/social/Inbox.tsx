import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";
import { getItem } from "../../../services/storage";

interface ApiMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  last_message: string;
  unread_count: number;
  last_message_time?: string;
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
}

export default function Inbox() {
  const router = useRouter();
  const userContext = useUser();
  const currentUser = userContext?.currentUser;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const token = await getItem("userToken");

      // 1. Récupérer les messages
      const messagesRes = await fetch(
        `http://192.168.1.164:3000/api/v1/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!messagesRes.ok) throw new Error("Failed to fetch messages");
      const messagesData = await messagesRes.json();

      console.log("API RAW RESPONSE:", JSON.stringify(messagesData, null, 2));

      // 2. Extraire tous les IDs d'utilisateurs
      const userIds: number[] = [];
      const conversationsMap = new Map<number, any>();

      for (const conversationData of messagesData) {
        if (!Array.isArray(conversationData) || conversationData.length !== 2)
          continue;

        const userId = conversationData[0];
        const messages = conversationData[1];

        if (userId === undefined || userId === null) continue;
        if (!Array.isArray(messages)) continue;

        userIds.push(userId);

        // Préparer les données de conversation
        const lastMessage = messages.length > 0 ? messages[0].content : "";
        const unreadCount = messages.filter(
          (msg: any) => msg.receiver_id === currentUser.id && !msg.read
        ).length;

        conversationsMap.set(userId, {
          id: userId,
          messages: messages,
          last_message: lastMessage,
          unread_count: unreadCount,
        });
      }

      // 3. Récupérer les infos des utilisateurs
      if (userIds.length > 0) {
        const usersRes = await fetch(
          `http://192.168.1.164:3000/api/v1/users?ids=${userIds.join(",")}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const usersMap = new Map(
            usersData.map((user: ApiUser) => [user.id, user])
          );

          // 4. Combiner les données
          const conversations: Conversation[] = [];

          for (const [userId, convData] of conversationsMap) {
            const userInfo = usersMap.get(userId) as ApiUser | undefined;

            conversations.push({
              id: userId,
              first_name: userInfo?.first_name || `Utilisateur ${userId}`,
              last_name: userInfo?.last_name || "",
              avatar_url: userInfo?.avatar_url,
              last_message: convData.last_message,
              unread_count: convData.unread_count,
            });
          }

          console.log("Processed conversations with user data:", conversations);
          setConversations(conversations);
          return;
        }
      }

      // Fallback: utiliser les placeholders si l'API users ne fonctionne pas
      const conversations: Conversation[] = [];
      for (const [userId, convData] of conversationsMap) {
        conversations.push({
          id: userId,
          first_name: `Utilisateur ${userId}`,
          last_name: "",
          avatar_url: undefined,
          last_message: convData.last_message,
          unread_count: convData.unread_count,
        });
      }

      console.log("Processed conversations with placeholders:", conversations);
      setConversations(conversations);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [fetchInbox])
  );

  useEffect(() => {
    // Vérifier les IDs dupliqués ou undefined
    const invalidItems = conversations.filter(
      (item) => item.id === undefined || item.id === null
    );

    if (invalidItems.length > 0) {
      console.warn("Items with invalid IDs:", invalidItems);
    }

    const ids = conversations.map((item) => item.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      console.warn("Duplicate IDs found:", duplicateIds);
    }
  }, [conversations]);

  if (!currentUser || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <SocialHeader />

        <FlatList
          data={conversations}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: conversations.length ? "flex-start" : "center",
            paddingBottom: 100,
            marginTop: 25,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationRow}
              onPress={() =>
                router.push({
                  pathname: "./Chat",
                  params: {
                    targetUserId: item.id.toString(),
                    targetUserName: `${item.first_name} ${
                      item.last_name || ""
                    }`.trim(),
                  },
                })
              }
            >
              <Image
                source={{
                  uri:
                    item.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.first_name +
                        (item.last_name ? ` ${item.last_name}` : "")
                    )}&background=E24741&color=fff`,
                }}
                style={styles.avatar}
              />

              <View style={styles.textContainer}>
                <Text style={styles.name}>
                  {item.first_name} {item.last_name || ""}
                </Text>
                <Text numberOfLines={1} style={styles.lastMessage}>
                  {item.last_message}
                </Text>
                {item.last_message_time && (
                  <Text style={styles.timeText}>
                    {new Date(item.last_message_time).toLocaleTimeString()}
                  </Text>
                )}
              </View>

              {item.unread_count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread_count}</Text>
                </View>
              )}

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                📭 Aucune conversation pour le moment
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.newMessageBtn}
          onPress={() => router.push("/screens/social/NewMessage")}
        >
          <Text style={styles.newMessageText}>✉️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F0E8" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F0E8",
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontWeight: "600", fontSize: 16, marginBottom: 2 },
  lastMessage: { color: "#666" },
  chevron: { fontSize: 24, color: "#ccc" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: "#999" },
  newMessageBtn: {
    position: "absolute",
    bottom: 50,
    right: 30,
    backgroundColor: "#E24741",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  newMessageText: { color: "#fff", fontSize: 28 },
  badge: {
    backgroundColor: "#E24741",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 6,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});
