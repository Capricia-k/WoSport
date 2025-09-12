import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, View } from "react-native";
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "../services/api";
import { getItem, removeItem, setItem } from "../services/storage";

export type ProfileVisibility = "everyone" | "friends" | "only_me";

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
  token: string;
  avatar_url?: string;
  bio?: string;
  profileVisibility: ProfileVisibility;
}

interface UserContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (newAvatarUrlOrFile: string) => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};

interface Props {
  children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await getItem("userToken");
      const id = await getItem("userId");
      const first_name = await getItem("userName");
      const avatar_url = await getItem("userAvatar");
      const rawVisibility = await getItem("userProfileVisibility");

      // 🔹 conversion sécurisée
      let profileVisibility: ProfileVisibility = "everyone";
      if (
        rawVisibility === "friends" ||
        rawVisibility === "only_me" ||
        rawVisibility === "everyone"
      ) {
        profileVisibility = rawVisibility;
      }

      if (token && id && first_name) {
        setCurrentUser({
          id: parseInt(id, 10),
          first_name,
          token,
          avatar_url: avatar_url || undefined,
          profileVisibility,
        });
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Expo push token when currentUser is available
  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token || !mounted) return;

        // send token to backend
        await savePushToken(token);
        // optionally store locally
        await setItem("expoPushToken", token);
      } catch (err) {
        console.error("[UserProvider] push token error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const updateCurrentUser = async (
    updates: Partial<User> | ((prev: User) => Partial<User>)
  ) => {
    if (!currentUser) return;

    const partialUpdates =
      typeof updates === "function" ? updates(currentUser) : updates;

    const updatedUser = { ...currentUser, ...partialUpdates };
    setCurrentUser(updatedUser);

    if (partialUpdates.first_name)
      await setItem("userName", partialUpdates.first_name);
    if (partialUpdates.avatar_url)
      await setItem("userAvatar", partialUpdates.avatar_url);
    if (partialUpdates.profileVisibility)
      await setItem("userProfileVisibility", partialUpdates.profileVisibility);
    if (partialUpdates.bio) await setItem("userBio", partialUpdates.bio);
  };

  // --- Login ---
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://192.168.1.164:3000/users/sign_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email, password } }),
      });

      const data = await res.json();

      if (!res.ok || !data?.token || !data?.user) {
        throw new Error(data?.error || "Login failed");
      }

      const userWithToken: User = {
        ...data.user,
        token: data.token,
        profileVisibility: data.user.profile_visibility || "everyone", // 🔹 conversion API
      };

      // ⚡ Stockage dans AsyncStorage
      await setItem("userToken", data.token);
      await setItem("userId", data.user.id.toString());
      await setItem("userName", data.user.first_name);
      if (data.user.avatar_url) {
        await setItem("userAvatar", data.user.avatar_url);
      }
      await setItem("userProfileVisibility", userWithToken.profileVisibility);

      setCurrentUser(userWithToken);
    } catch (err) {
      console.error("[UserProvider] Login error:", err);
      throw err;
    }
  };

  // --- Logout ---
  const logout = async () => {
    setCurrentUser(null);
    await removeItem("userToken");
    await removeItem("userId");
    await removeItem("userName");
    await removeItem("userAvatar");
    await removeItem("userProfileVisibility");
  };

  // --- Update avatar ---
  const updateAvatar = async (newAvatarUrlOrFile: string) => {
    if (!currentUser) return;

    let avatarUrl = newAvatarUrlOrFile;

    if (newAvatarUrlOrFile.startsWith("file://")) {
      const formData = new FormData();
      formData.append("user[avatar]", {
        uri: newAvatarUrlOrFile,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(`http://192.168.1.164:3000/users/upload_avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload avatar");
      const data = await res.json();
      avatarUrl = data.avatar_url;
    }

    const updatedUser = { ...currentUser, avatar_url: avatarUrl };
    setCurrentUser(updatedUser);
    await setItem("userAvatar", avatarUrl);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F0E8",
        }}
      >
        <ActivityIndicator size="large" color="#E24741" />
      </View>
    );
  }

  return (
    <UserContext.Provider
      value={{ currentUser, login, logout, updateAvatar, updateCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
