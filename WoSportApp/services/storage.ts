import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ------------------------------------
// Basic Storage Helpers
// ------------------------------------
export const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return AsyncStorage.getItem(key);
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") return localStorage.setItem(key, value);
  return AsyncStorage.setItem(key, value);
};

export const removeItem = async (key: string): Promise<void> => {
  if (Platform.OS === "web") return localStorage.removeItem(key);
  return AsyncStorage.removeItem(key);
};

// ------------------------------------
// Types
// ------------------------------------
export type SavedVideo = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
};

export type SavedBoard = {
  id: string;
  title: string;
  videos: SavedVideo[];
};

// ------------------------------------
// Helper: Generate thumbnail
// ------------------------------------
const getThumbnail = (video: { video_url: string; thumbnail_url?: string }): string => {
  if (video.thumbnail_url) return video.thumbnail_url;
  const fileName = video.video_url.split("/").pop()?.replace(".mp4", ".jpg");
  return fileName
    ? `https://res.cloudinary.com/dx16ewfq2/video/upload/w_300,h_200,c_fill/${fileName}`
    : "https://via.placeholder.com/150";
};

// ------------------------------------
// Boards Functions
// ------------------------------------
export const getSavedBoards = async (): Promise<SavedBoard[]> => {
  const data = await getItem("savedBoards");
  if (!data) return [];

  try {
    const parsed: SavedBoard[] = JSON.parse(data);
    return parsed.map(b => ({
      ...b,
      videos: b.videos?.map(v => ({
        ...v,
        thumbnail_url: getThumbnail(v),
      })) || [],
    }));
  } catch (err) {
    console.error("[getSavedBoards] JSON parse error:", err);
    return [];
  }
};

export const saveVideoInBoard = async (
  video: { title: string; video_url: string; thumbnail_url?: string },
  boardId?: string,
  newBoardName?: string
): Promise<void> => {
  const boards = await getSavedBoards();

  const videoWithThumbnail: SavedVideo = {
    id: Date.now().toString(),
    title: video.title,
    video_url: video.video_url,
    thumbnail_url: getThumbnail(video),
  };

  if (boardId) {
    const updated = boards.map(b =>
      b.id === boardId ? { ...b, videos: [...b.videos, videoWithThumbnail] } : b
    );
    await setItem("savedBoards", JSON.stringify(updated));
    return;
  }

  if (newBoardName) {
    const newBoard: SavedBoard = {
      id: Date.now().toString(),
      title: newBoardName,
      videos: [videoWithThumbnail],
    };
    await setItem("savedBoards", JSON.stringify([...boards, newBoard]));
  }
};

export const updateBoardTitle = async (boardId: string, newTitle: string): Promise<boolean> => {
  const boards = await getSavedBoards();
  const index = boards.findIndex(b => b.id === boardId);
  if (index === -1) return false;

  boards[index].title = newTitle;
  await setItem("savedBoards", JSON.stringify(boards));
  return true;
};

export const deleteBoard = async (id: string): Promise<boolean> => {
  const boards = await getSavedBoards();
  const updated = boards.filter(b => b.id !== id);
  if (updated.length === boards.length) return false; // pas de suppression
  await setItem("savedBoards", JSON.stringify(updated));
  return true;
};

// ------------------------------------
// Avatar Helper
// ------------------------------------
export const getAvatarSource = (user?: { first_name: string; avatar_url?: string } | null) => {
  if (!user || !user.first_name) {
    return {
      uri: `https://ui-avatars.com/api/?name=User&background=E24741&color=fff`,
    };
  }

  const name = encodeURIComponent(user.first_name);
  return user.avatar_url
    ? { uri: user.avatar_url }
    : { uri: `https://ui-avatars.com/api/?name=${name}&background=E24741&color=fff` };
};
