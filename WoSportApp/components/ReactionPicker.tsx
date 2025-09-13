import { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

const REACTIONS = [
  { type: "like", emoji: "👍", color: "#1877F2" },
  { type: "love", emoji: "❤️", color: "#F33E58" },
  { type: "laugh", emoji: "😂", color: "#F7B928" },
  { type: "surprise", emoji: "😮", color: "#F7B928" },
  { type: "sad", emoji: "😢", color: "#F7B928" },
  { type: "angry", emoji: "😠", color: "#E74C3C" },
];

interface ReactionPickerProps {
  onReaction: (reactionType: string) => void;
  visible: boolean;
  onClose: () => void;
}

export default function ReactionPicker({
  onReaction,
  visible,
  onClose,
}: ReactionPickerProps) {
  const [animation] = useState(new Animated.Value(0));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.picker}>
        {REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.type}
            style={styles.reactionButton}
            onPress={() => {
              onReaction(reaction.type);
              onClose();
            }}
          >
            <AppText style={[styles.emoji, { fontSize: 28 }]}>
              {reaction.emoji}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  picker: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  emoji: {
    fontSize: 24,
  },
});
