import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  createdAt: string; // ex: "2025-09-11T10:00:00Z"
  expiresAt: string; // ex: "2025-09-12T10:00:00Z"
  onComplete?: () => void;
};

export default function StoryProgressBar({
  createdAt,
  expiresAt,
  onComplete,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  // Convertir en timestamp
  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();

  // Temps total et restant (en ms)
  const totalDuration = expires - created;
  const remainingDuration = Math.max(expires - now, 0);

  useEffect(() => {
    if (remainingDuration <= 0) {
      if (onComplete) onComplete();
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    }).start(() => {
      if (onComplete) onComplete();
    });
  }, [remainingDuration]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    backgroundColor: "#ddd",
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: "#E24741", // couleur WoSport
  },
});
