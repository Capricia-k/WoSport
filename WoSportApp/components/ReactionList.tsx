// components/ReactionList.tsx
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

export interface ReactionListProps {
  reactions: Reaction[];
  visible: boolean;
  onClose: () => void;
}

const REACTION_EMOJIS: { [key: string]: string } = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
};

export default function ReactionList({
  reactions,
  visible,
  onClose,
}: ReactionListProps) {
  if (!visible) return null;

  const renderReactionItem = ({
    item,
    index,
  }: {
    item: Reaction;
    index: number;
  }) => (
    <View style={styles.reactionItem}>
      <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
      <View style={styles.reactionInfo}>
        <AppText style={styles.username}>{item.user.first_name}</AppText>
        <AppText style={styles.reactionType}>
          {REACTION_EMOJIS[item.reaction_type] || item.reaction_type}
        </AppText>
      </View>
    </View>
  );

  // Créer une clé unique qui combine ID et index pour éviter les doublons
  const keyExtractor = (item: Reaction, index: number) =>
    `${item.id}-${item.user.id}-${index}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Réactions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={reactions}
            keyExtractor={keyExtractor}
            renderItem={renderReactionItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aucune réaction pour le moment
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reactionInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  reactionType: {
    fontSize: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
  },
});
