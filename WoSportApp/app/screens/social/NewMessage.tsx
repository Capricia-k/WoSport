import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../../../context/UserContext";

interface User {
  id: number;
  first_name: string;
}

export default function NewMessage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");

  // Récupération des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch("http://192.168.1.164:3000/api/v1/users", {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data: User[] = await res.json();
        setUsers(data.filter((u) => u.id !== currentUser.id));
        setFilteredUsers(data.filter((u) => u.id !== currentUser.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [currentUser]);

  // Filtrer les utilisateurs selon la recherche
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) =>
          (u.first_name ?? "").toLowerCase().startsWith(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  // Envoyer le message
  const sendMessage = async () => {
    if (!selectedUserId || !text.trim()) return;
    try {
      const res = await fetch(
        `http://192.168.1.164:3000/api/v1/users/${selectedUserId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.token}`,
          },
          body: JSON.stringify({ content: text }),
        }
      );
      if (!res.ok) throw new Error("Failed to send message");
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: 16 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 45,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 18 }}>
            Choisir un destinataire :
          </Text>

          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#E24741" }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <TextInput
          placeholder="Rechercher un contact..."
          value={search}
          onChangeText={(t) => setSearch(t ?? "")}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#fff",
            marginBottom: 12,
          }}
        />

        {/* Liste filtrée des utilisateurs */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 12,
                backgroundColor:
                  selectedUserId === item.id ? "#E24741" : "#fff",
                marginVertical: 4,
                borderRadius: 8,
              }}
              onPress={() => setSelectedUserId(item.id)}
            >
              <Text
                style={{
                  color: selectedUserId === item.id ? "#fff" : "#000",
                }}
              >
                {item.first_name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Input + bouton en bas */}
        <View style={{ marginTop: "auto", marginBottom: 24 }}>
          <TextInput
            placeholder="Écrire un message..."
            value={text}
            onChangeText={setText}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "#fff",
            }}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              backgroundColor: "#E24741",
              padding: 12,
              borderRadius: 20,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
