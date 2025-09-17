// components/ReactionPicker.tsx
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReactionPickerProps {
  visible: boolean;
  onReaction: (reactionType: number) => void;
  onClose: () => void;
}

const REACTIONS = [
  { type: 0, emoji: "👍", label: "Like" },
  { type: 1, emoji: "❤️", label: "Love" },
  { type: 2, emoji: "😂", label: "Laugh" },
  { type: 3, emoji: "😮", label: "Wow" },
  { type: 4, emoji: "😢", label: "Sad" },
  { type: 5, emoji: "😠", label: "Angry" },
];

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  visible,
  onReaction,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.reactionsContainer}>
            {REACTIONS.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                style={styles.reactionButton}
                onPress={() => {
                  console.log("🔍 Selected reaction:", reaction.type);
                  onReaction(reaction.type);
                  onClose();
                }}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionLabel}>{reaction.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  reactionButton: {
    padding: 10,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  reactionLabel: {
    color: "#000",
  },
});

export default ReactionPicker;
