import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../context/UserContext";

export default function Header() {
  const router = useRouter();
  const { logout } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuVisible(false);
    router.replace("./Login");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#3c3c3c" />
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => router.push("/screens/Profile")}
        >
          <Ionicons name="person-outline" size={24} color="#3c3c3c" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.icon}>
          <Ionicons name="cart-outline" size={24} color="#3c3c3c" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => setMenuVisible((prev) => !prev)}
        >
          <MaterialCommunityIcons name="menu" size={28} color="#3c3c3c" />
        </TouchableOpacity>
      </View>

      {/* Dropdown avec Pressable pour fermer si clic à l’extérieur */}
      {menuVisible && (
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Text style={styles.dropdownText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
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
    backgroundColor: "#f5f0e8",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { marginLeft: 20 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  dropdown: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});
