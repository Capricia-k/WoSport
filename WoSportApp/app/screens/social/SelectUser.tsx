import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../../../context/UserContext";

interface User {
  id: number;
  first_name: string;
  avatar_url?: string;
}

export default function SelectUser() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { forwardedPost } = useLocalSearchParams<{ forwardedPost?: string }>();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const post = forwardedPost ? JSON.parse(forwardedPost) : null;

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch("http://192.168.1.164:3000/api/v1/users", {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data: User[] = await res.json();
        setUsers(data.filter((u) => u.id !== currentUser.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const getAvatarSource = (user?: User) =>
    user?.avatar_url
      ? { uri: user.avatar_url }
      : {
          uri: `https://ui-avatars.com/api/?name=${
            user?.first_name ?? "User"
          }&background=E24741&color=fff`,
        };

  const goToChat = (userId: number, firstName: string) => {
    router.push({
      pathname: "/screens/social/Chat",
      params: {
        targetUserId: userId.toString(),
        targetUserName: firstName,
        forwardedPost: forwardedPost,
      },
    });
  };

  const getPostImage = (post: any) => {
    if (!post) return null;
    if (post.photos?.length) return post.photos[0].url;
    if (post.videos?.length) return post.videos[0].url;
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <Text style={{ fontWeight: "600", fontSize: 18, margin: 16 }}>
        Choisir un destinataire :
      </Text>

      {/* Aperçu du post */}
      {post && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            padding: 12,
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#E24741",
                paddingBottom: 20,
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            📌 Post à partager
          </Text>
          <Text numberOfLines={3} style={{ marginBottom: 6 }}>
            {post.content}
          </Text>

          {getPostImage(post) && (
            <Image
              source={{ uri: getPostImage(post) }}
              style={{ width: "50%", height: 120, borderRadius: 8 }}
            />
          )}
        </View>
      )}

      {/* Liste des utilisateurs */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => goToChat(item.id, item.first_name)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              marginHorizontal: 16,
              marginVertical: 4,
              backgroundColor: selectedUserId === item.id ? "#E24741" : "#fff",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Image
              source={getAvatarSource(item)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                color: selectedUserId === item.id ? "#fff" : "#000",
                fontSize: 16,
              }}
            >
              {item.first_name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
