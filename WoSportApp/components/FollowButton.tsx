import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { followUser, unfollowUser } from "../services/api";

type FollowResponse = {
  success?: boolean; // optionnel
  follow_id?: number;
  followers_count?: number;
  is_following?: boolean;
};

type Props = {
  targetUserId: number;
  initialIsFollowing: boolean;
  initialFollowId?: number | null;
  token: string;
  initialFollowersCount: number;
};

export const FollowButton: React.FC<Props> = ({
  targetUserId,
  initialIsFollowing,
  token,
  initialFollowId = null,
  initialFollowersCount,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followId, setFollowId] = useState<number | null>(initialFollowId);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);

    try {
      if (isFollowing && followId) {
        // Unfollow
        const data: FollowResponse = await unfollowUser(followId, token);
        setIsFollowing(false);
        setFollowId(null);
        setFollowersCount(data.followers_count ?? followersCount - 1);
      } else {
        // Follow
        const data: FollowResponse = await followUser(targetUserId, token);
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
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
      ]}
      onPress={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isFollowing ? "#fff" : "#E24741"} />
      ) : (
        <Text style={[styles.text, !isFollowing && { color: "#E24741" }]}>
          {isFollowing ? "Following" : "Follow"} ({followersCount})
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  following: {
    backgroundColor: "#E24741",
  },
  notFollowing: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#E24741",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});
