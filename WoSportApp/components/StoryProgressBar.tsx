// components/StoryProgressBar.tsx
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  duration?: number; // Durée en ms
  onComplete?: () => void;
  isPaused?: boolean;
  isActive?: boolean;
};

export default function StoryProgressBar({
  duration = 5000,
  onComplete,
  isPaused = false,
  isActive = true,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isActive) {
      progress.setValue(0);
      return;
    }

    if (isPaused) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && onComplete) {
        onComplete();
      }
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive, isPaused, duration]);

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
    backgroundColor: "#FFFFFF40",
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
});
