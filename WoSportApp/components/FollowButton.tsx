import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { followUser, unfollowUser } from "../services/api";

type FollowResponse = {
  success?: boolean;
  follow_id?: number;
  followers_count?: number;
  is_following?: boolean;
};

interface FollowButtonProps {
  targetUserId: number;
  initialIsFollowing: boolean;
  initialFollowId: number | null;
  initialFollowersCount: number;
  token: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialIsFollowing,
  initialFollowId,
  initialFollowersCount,
  token,
  style,
  textStyle,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followId, setFollowId] = useState<number | null>(initialFollowId);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing && followId) {
        const data: FollowResponse = await unfollowUser(followId);
        setIsFollowing(false);
        setFollowId(null);
        setFollowersCount(data.followers_count ?? followersCount - 1);
      } else {
        const data: FollowResponse = await followUser(targetUserId);
        setIsFollowing(true);
        setFollowId(data.follow_id ?? null);
        setFollowersCount(data.followers_count ?? followersCount + 1);
      }
    } catch (err) {
      console.error("[FollowButton] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseBtn,
        isFollowing ? styles.following : styles.notFollowing,
        style,
      ]}
      onPress={handleFollowToggle}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isFollowing ? "#333" : "#fff"} />
      ) : (
        <Text
          style={[
            styles.text,
            isFollowing ? { color: "#333" } : { color: "#fff" },
            textStyle,
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  notFollowing: {
    backgroundColor: "#9b5f2f",
  },
  following: {
    backgroundColor: "#f6f2e9",
    borderWidth: 1,
    borderColor: "#9b5f2f",
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
