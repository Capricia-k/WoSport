import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../../components/SocialHeader";
import { useUser } from "../../../context/UserContext";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  avatar_url?: string;
  post?: {
    id: number;
    content: string;
    photos?: { url: string }[];
    videos?: { url: string }[];
  };
}

export default function ChatScreen() {
  const { targetUserId, targetUserName, forwardedPost } = useLocalSearchParams<{
    targetUserId: string;
    targetUserName?: string;
    forwardedPost?: string;
  }>();

  const { currentUser } = useUser();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sharedPost, setSharedPost] = useState<Message["post"] | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!currentUser || !targetUserId) return;

    try {
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/users/${targetUserId}/conversation`,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch messages");

      const data = await res.json();
      const conversationMessages = data.conversation || [];

      setMessages(conversationMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if ((!text.trim() && !sharedPost) || !currentUser || !targetUserId) return;

    try {
      const payload: any = {};
      if (text.trim()) payload.content = text;
      if (sharedPost) payload.post_id = sharedPost.id;

      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/users/${targetUserId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      setText("");
      setSharedPost(null);
      await fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!currentUser) return;

    try {
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/messages/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete message");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  useEffect(() => {
    if (forwardedPost) {
      try {
        const parsed = JSON.parse(forwardedPost);
        setSharedPost(parsed);
        if (parsed.content) setText(parsed.content);
      } catch (e) {
        console.error("Erreur parsing forwardedPost", e);
      }
    }
  }, [forwardedPost]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [currentUser, targetUserId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F0E8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView>
        <SocialHeader />
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender_id === currentUser?.id
                ? styles.myMessage
                : styles.theirMessage,
            ]}
          >
            {/* Texte du message */}
            {item.content ? (
              <Text
                style={{
                  color: item.sender_id === currentUser?.id ? "#fff" : "#000",
                }}
              >
                {item.content}
              </Text>
            ) : null}

            {/* Aperçu du post */}
            {item.post && (
              <TouchableOpacity
                style={styles.postPreview}
                onPress={() =>
                  router.push(
                    `/screens/social/SendPost?postId=${item.post?.id}`
                  )
                }
              >
                {/* Afficher photo si dispo */}
                {item.post.photos && item.post.photos.length > 0 && (
                  <Image
                    source={{ uri: item.post.photos[0].url }}
                    style={styles.postImage}
                  />
                )}

                {/* Afficher miniature vidéo si dispo (optionnel, juste un rectangle gris ici) */}
                {(!item.post.photos || item.post.photos.length === 0) &&
                  item.post.videos &&
                  item.post.videos.length > 0 && (
                    <Video
                      source={{ uri: item.post.videos[0].url }}
                      style={styles.postImage}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isLooping={false}
                      useNativeControls={false}
                    />
                  )}

                {/* Contenu texte */}
                <Text numberOfLines={2} style={styles.postContent}>
                  {item.post.content}
                </Text>
              </TouchableOpacity>
            )}

            {/* Supprimer si c'est ton message */}
            {item.sender_id === currentUser?.id && (
              <TouchableOpacity onPress={() => deleteMessage(item.id)}>
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Encart du post partagé avant envoi */}
      {sharedPost && (
        <View style={styles.sharedPostBox}>
          <View style={styles.sharedPostHeader}>
            <Text style={styles.sharedPostTitle}>📌 Post partagé</Text>
            <TouchableOpacity onPress={() => setSharedPost(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text numberOfLines={3}>{sharedPost.content}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  message: { margin: 8, padding: 12, borderRadius: 12, maxWidth: "70%" },
  myMessage: {
    backgroundColor: "#fe4e4b",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  deleteText: { color: "orange", marginTop: 4, fontSize: 12 },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingBottom: 45,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: "#fe4e4b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "600" },
  sharedPostBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sharedPostTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  postPreview: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  postImage: {
    width: 120,
    height: 80,
    borderRadius: 6,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: "#333",
  },
  sharedPostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fe4e4b",
    paddingHorizontal: 6,
  },
});
