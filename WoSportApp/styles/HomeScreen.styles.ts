import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    padding: 16,
  },
  dailyCalories: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  calorieText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calorieLabel: {
    fontSize: 14,
    color: "#555",
  },
  buttonsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 9,
    marginBottom: 12,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trainingImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  shopItem: {
    marginRight: 16,
  },
  shopImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 4,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});
