import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BasicHeader from "../../../components/BasicHeader";
import { followUser, getFriends, searchUsers } from "../../../services/api";

interface User {
  id: number;
  first_name: string;
  avatar_url?: string;
  bio?: string;
}

export default function SearchUser() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [recentSearches, setRecentSearches] = useState<User[]>([]);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);

  // Charger l’historique
  useEffect(() => {
    const loadHistory = async () => {
      const saved = await AsyncStorage.getItem("recentSearches");
      if (saved) setRecentSearches(JSON.parse(saved));
    };
    loadHistory();
  }, []);

  // Sauvegarder l’historique
  const saveHistory = async (newHistory: User[]) => {
    setRecentSearches(newHistory);
    await AsyncStorage.setItem("recentSearches", JSON.stringify(newHistory));
  };

  // Rechercher
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    try {
      const data = await searchUsers(text);
      setResults(data);
    } catch (e) {
      console.error("Search error", e);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Historique
        const saved = await AsyncStorage.getItem("recentSearches");
        if (saved) setRecentSearches(JSON.parse(saved));

        // Amis déjà suivis
        const friends = await getFriends();
        setFollowedUsers(friends.map((f) => f.id));
      } catch (e) {
        console.error("Erreur init search:", e);
      }
    };
    loadInitialData();
  }, []);

  // Sélection d’un user
  const handleSelectUser = async (user: User) => {
    const newHistory = [
      user,
      ...recentSearches.filter((u) => u.id !== user.id),
    ].slice(0, 5);
    await saveHistory(newHistory);

    router.push({
      pathname: "/screens/social/UserProfile",
      params: { targetUserId: user.id.toString() },
    });
  };

  const renderUser = ({ item }: { item: User }) => {
    const isFollowed = followedUsers.includes(item.id);

    const handleAddFriend = async () => {
      if (isFollowed) return; // déjà suivi
      try {
        const res = await followUser(item.id);
        if (res.success || res.is_following) {
          setFollowedUsers((prev) => [...prev, item.id]);
        }
      } catch (e: any) {
        if (e.message.includes("already following")) {
          setFollowedUsers((prev) => [...prev, item.id]);
        } else {
          console.error("Erreur follow:", e);
        }
      }
    };

    return (
      <TouchableOpacity
        onPress={() => handleSelectUser(item)}
        style={styles.userCard}
      >
        <Image
          source={{
            uri:
              item.avatar_url ??
              `https://ui-avatars.com/api/?name=${item.first_name}`,
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.first_name}</Text>
          <Text style={styles.userBio}>{item.bio ?? "Sportive WoSport"}</Text>
        </View>

        {/* ✅ Si déjà suivi → coche, sinon bouton ADD */}
        {isFollowed ? (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      {/* Header au-dessus du container */}
      <BasicHeader />

      {/* Contenu scrollable */}
      <View style={styles.container}>
        {/* Champ recherche */}
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Rechercher une sportive..."
            placeholderTextColor="#9b5f2f"
            style={styles.searchInput}
          />
        </View>

        {/* Résultats */}
        {query.length >= 2 ? (
          results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUser}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucune sportive trouvée,{"\n"}essaie un autre mot-clé
              </Text>
            </View>
          )
        ) : (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Recherches récentes
            </Text>
            {recentSearches.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() => handleSelectUser(u)}
                style={styles.userCard}
              >
                <Image
                  source={{
                    uri:
                      u.avatar_url ??
                      `https://ui-avatars.com/api/?name=${u.first_name}`,
                  }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.first_name}</Text>
                </View>
                {followedUsers.includes(u.id) ? (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    padding: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#3c3c3c",
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#9b5f2f",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  searchInput: {
    fontSize: 16,
    color: "#3c3c3c",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#9b5f2f",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
  },
  userBio: {
    fontSize: 13,
    color: "#6b6b6b",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#9b5f2f",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  addButtonText: {
    color: "#9b5f2f",
    fontWeight: "600",
  },
  checkmarkContainer: {
    borderWidth: 1,
    borderColor: "#9b5f2f",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#9b5f2f",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6b6b6b",
  },
});
