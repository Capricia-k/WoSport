import { StyleSheet, View } from "react-native";
import { AppText } from "../../components/AppText";

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Nutrition</AppText>
      {/* Ici tu pourras ajouter le contenu de la nutrition */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
