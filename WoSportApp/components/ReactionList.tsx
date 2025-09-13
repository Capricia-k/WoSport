import { FlatList, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

interface Reaction {
  id: number;
  reaction_type: string;
  user: {
    id: number;
    first_name: string;
    avatar_url: string;
  };
}

interface ReactionListProps {
  reactions: Reaction[];
  visible: boolean;
}

const REACTION_EMOJIS: { [key: string]: string } = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  surprise: "😮",
  sad: "😢",
  angry: "😠",
};

export default function ReactionList({
  reactions,
  visible,
}: ReactionListProps) {
  if (!visible || reactions.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={reactions}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reactionItem}>
            <AppText style={styles.emoji}>
              {REACTION_EMOJIS[item.reaction_type]}
            </AppText>
            <AppText style={styles.username}>{item.user.first_name}</AppText>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  list: {
    paddingHorizontal: 16,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  username: {
    fontSize: 12,
    color: "#333",
  },
});
