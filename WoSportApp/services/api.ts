import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import { getItem, setItem } from "./storage";

export const API_BASE = "http://192.168.1.164:3000/api/v1";

// ------------------ TYPES ------------------
export type Visibility = "public" | "private";
export type ProfileVisibility = "everyone" | "friends" | "only_me";

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  profileVisibility: ProfileVisibility;
  followers?: number[];
  following?: number[];
  is_verified?: boolean;
}

export interface Comment {
  id: number;
  body: string;
  user_id: number;
  user?: User;
}

export interface MediaItem {
  url: string;
  type: "image" | "video";
}

export interface ApiPost {
  id: number;
  content?: string;
  user: User;
  photos: MediaItem[];
  videos: MediaItem[];
  visibility: Visibility;
  comments: Comment[];
  comments_count: number;
  encouragements_count: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  start_time: string;
  end_time?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  latitude: number;
  longitude: number;
  recorded_at: string;
  session_id: number;
}

export interface LoginResponse {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    email: string;
    profile_visibility: Visibility;
    bio?: string;
    followers?: number[];
    following?: number[];
  };
  token: string;
}


// ------------------ UTILS ------------------
async function getAuthHeaders(auth = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (auth) {
    const token = await getItem("userToken");
    if (!token) throw new Error("User not logged in");
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {}
): Promise<T> {
  const headers = await getAuthHeaders(options.auth);
  
  // Ne pas ajouter Content-Type pour FormData (le navigateur le fera automatiquement)
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE}/${path}`;
  console.log("🔍 API Request:", {
    url,
    method: options.method || "GET",
    headers,
    body: options.body instanceof FormData ? "FormData" : options.body
  });

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  console.log("🔍 API Response:", {
    status: res.status,
    statusText: res.statusText,
    url: res.url
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("🔍 API Error:", errorText);
    throw new Error(errorText || `HTTP error! status: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ------------------ MAPPERS ------------------
export function mapVisibilityToProfileVisibility(visibility: string | number): ProfileVisibility {
  if (typeof visibility === "number") {
    // correspondance avec ton enum Rails
    switch (visibility) {
      case 0: return "everyone"; // public
      case 1: return "friends";  // friends
      case 2: return "only_me";  // private
      default: return "everyone";
    }
  }
  // cas string
  switch (visibility) {
    case "public": return "everyone";
    case "private": return "only_me";
    default: return "everyone";
  }
}


export function mapUserFromApi(data: any): User {
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    avatar_url: data.avatar_url,
    bio: data.bio,
    followers: data.followers ?? [],
    following: data.following ?? [],
    profileVisibility: mapVisibilityToProfileVisibility(data.profile_visibility),
  };
}

// ------------------ AUTH ------------------
export const registerUser = async (form: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const res = await fetch(`${API_BASE.replace("/api/v1", "")}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: form }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || "Registration failed");
  }
  return res.json();
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data: LoginResponse = await res.json();

  if (!data.token || !data.user) throw new Error("Token was not stored properly after login");

  await setItem("userToken", data.token);
  await setItem("userId", data.user.id.toString());
  await setItem("userFirstName", data.user.first_name);

  return mapUserFromApi(data.user);
};

// ------------------ CURRENT USER ------------------
export const getCurrentUser = async (): Promise<User | null> => {
  const userId = await getItem("userId");
  const firstName = await getItem("userFirstName");
  if (!userId) return null;
  return {
    id: Number(userId),
    first_name: firstName || "",
    email: "",
    profileVisibility: "everyone",
    followers: [],
    following: [],
  };
};

// ------------------ PROFILE ------------------
export async function toggleProfileVisibility(
  token: string,
  visibility: ProfileVisibility
) {
  try {
    const response = await fetch(`${API_BASE}/users/toggle_visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_visibility: visibility }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.join(", ") || "Erreur inconnue");
    }

    const data = await response.json();
    return data; // ici TypeScript voit `any` par défaut
  } catch (err) {
    console.error("Toggle visibility error:", err);
    throw err;
  }
}

export async function updateUserProfile(
  token: string,
  updates: Partial<{ first_name: string; last_name: string; bio: string; profile_visibility: ProfileVisibility }>
): Promise<User> {
  const res = await fetch(`${API_BASE}/users/update_profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user: updates }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.errors?.join(", ") || "Erreur inconnue");
  }

  const data = await res.json();
  return mapUserFromApi(data);
}

// ------------------ CYCLES ------------------
export const getCycles = () => apiFetch("cycles", { auth: true });
export const createCycle = (cycle: any) =>
  apiFetch("cycles", { method: "POST", body: { cycle }, auth: true });
export const updateCycle = (id: number, cycle: any) =>
  apiFetch(`cycles/${id}`, { method: "PUT", body: { cycle }, auth: true });
export const deleteCycle = (id: number) =>
  apiFetch(`cycles/${id}`, { method: "DELETE", auth: true });

// ------------------ SESSIONS / GPS ------------------
export const createSession = async (): Promise<Session> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");
  return apiFetch<Session>(`users/${user.id}/sessions`, {
    method: "POST",
    body: { session: { start_time: new Date().toISOString() } },
    auth: true,
  });
};

export const stopSession = async (sessionId: number): Promise<Session> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");
  return apiFetch<Session>(`users/${user.id}/sessions/${sessionId}/stop`, {
    method: "PATCH",
    auth: true,
  });
};

export const addPosition = async (
  sessionId: number,
  latitude: number,
  longitude: number
): Promise<Position> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");
  return apiFetch<Position>(`users/${user.id}/sessions/${sessionId}/positions`, {
    method: "POST",
    body: { position: { latitude, longitude } },
    auth: true,
  });
};

// ------------------ SOS ------------------
export const sendSOSAlert = async (message?: string) => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const appleMapsUrl = `http://maps.apple.com/?ll=${latitude},${longitude}`;

    const firstName = (await getItem("userFirstName")) || "Utilisateur";
    const finalMessage = message || `🚨 SOS! ${firstName} se sent en danger !`;

    await apiFetch("sos_alerts", {
      method: "POST",
      auth: true,
      body: {
        message: finalMessage,
        latitude,
        longitude,
        google_maps_url: googleMapsUrl,
        apple_maps_url: appleMapsUrl,
      },
    });

    Alert.alert(
      "Alerte envoyée",
      "Vos proches ont été prévenus !\nGoogle Maps et Apple Plans inclus."
    );
  } catch (error) {
    Alert.alert("Erreur", "Impossible d’envoyer l’alerte.");
    console.error(error);
  }
};

// ------------------ SOCIAL ------------------
export const getPosts = async (page = 1): Promise<ApiPost[]> => {
  try {
    return apiFetch<ApiPost[]>(`posts?page=${page}`);
  } catch (err) {
    console.error("[getPosts] error:", err);
    return [];
  }
};

export type MediaFile = { uri: string; type: string; fileName?: string };

export async function createPost(
  content: string,
  media: MediaFile[],
  visibility: Visibility = "public"
) {
  const token = await getItem("userToken");
  if (!token) throw new Error("User not logged in");

  const formData = new FormData();
  formData.append("post[content]", content);
  formData.append("post[visibility]", visibility);

  media.forEach((file, index) => {
    const isVideo = file.type.startsWith("video");
    const key = isVideo ? "post[videos][]" : "post[photos][]";
    const ext = file.type.split("/")[1];
    const name = file.fileName ?? `upload-${index}.${ext}`;
    formData.append(key, {
      uri: file.uri.startsWith("file://") ? file.uri : "file://" + file.uri,
      type: file.type,
      name,
    } as any);
  });

  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur API: ${res.status} - ${text}`);
  }

  return res.json();
}

export const deletePost = async (postId: number) =>
  apiFetch<void>(`posts/${postId}`, { method: "DELETE", auth: true });

export const addComment = async (postId: number, body: string) =>
  apiFetch<Comment>(`posts/${postId}/comments`, {
    method: "POST",
    body: { comment: { body } },
    auth: true,
  });

export const deleteComment = async (postId: number, commentId: number) =>
  apiFetch<void>(`posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    auth: true,
  });

export const toggleEncouragement = async (postId: number) =>
  apiFetch<{ encouragements_count: number }>(
    `posts/${postId}/encouragements`,
    { method: "POST", auth: true }
  );

  export const getFriends = async (): Promise<User[]> => {
  const token = await getItem("userToken");
  if (!token) throw new Error("User not logged in");

  const res = await fetch(`${API_BASE}/users/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur API friends: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.map(mapUserFromApi);
};

export async function searchUsers(query: string, token?: string) {
  try {
    const response = await fetch(
      `${API_BASE}/users/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) throw new Error("Erreur recherche utilisateur");
    return await response.json();
  } catch (error) {
    console.error("[searchUsers]", error);
    return [];
  }
}


// ------------------ NOTIFICATIONS ------------------
export const savePushToken = async (token: string) => {
  return apiFetch<{ success: boolean }>("users/save_token", {
    method: "POST",
    auth: true,
    body: { expo_push_token: token },
  });
};

export const getUnreadMessagesCount = async (): Promise<{ unread_count: number }> => {
  return apiFetch<{ unread_count: number }>("messages/unread_count", {
    auth: true,
  });
};

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Permission refusée pour les notifications !");
      return null;
    }

    const tokenObj = await Notifications.getExpoPushTokenAsync();
    token = tokenObj.data;
  } else {
    console.warn("Les notifications push fonctionnent seulement sur un vrai appareil !");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}


// ------------------ FOLLOWS ------------------
export const followUser = async (userId: number) =>
  apiFetch<{
    success: boolean;
    follow_id: number;
    followers_count: number;
    is_following: boolean;
  }>("follows", { method: "POST", body: { follow: { followed_id: userId } }, auth: true });

export const unfollowUser = async (followId: number) =>
  apiFetch<{ followers_count: number; is_following: boolean }>(
    `follows/${followId}`,
    { method: "DELETE", auth: true }
  );
