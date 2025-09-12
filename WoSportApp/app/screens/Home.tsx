import { useRouter } from "expo-router";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/AppText";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/HomeScreen.styles";

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser } = useUser();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>

      <View style={{ paddingHorizontal: 16 }}>
        <AppText style={{ fontSize: 22, fontWeight: "600", color: "#425439" }}>
          Hello{currentUser?.first_name ? `, ${currentUser.first_name}` : ""} 👋
        </AppText>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/wosport-logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Daily Calories */}
      <View style={styles.dailyCalories}>
        <AppText style={styles.calorieText}>1,200 / 2,000 cal</AppText>
        <AppText style={styles.calorieLabel}>DAILY CALORIES</AppText>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsWrapper}>
        {["Workout", "Nutrition", "Cycle", "Community", "Go for a run!"].map(
          (btn) => (
            <TouchableOpacity
              key={btn}
              style={styles.button}
              onPress={() => {
                if (btn === "Cycle") router.push("/screens/Cycles");
                if (btn === "Workout") router.push("/screens/WorkoutsScreen");
                if (btn === "Community")
                  router.push("/screens/social/SocialFeed");
                if (btn === "Go for a run!")
                  router.push("../sessions/SessionTracking");
              }}
            >
              <AppText style={styles.buttonText}>{btn}</AppText>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Today's Training */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Todays Training</AppText>
        <Image
          source={require("../../assets/images/yoga-session.jpg")}
          style={styles.trainingImage}
        />
      </View>

      {/* Wo Shop */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Wo shop</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <View style={styles.shopItem}>
            <Image
              source={require("../../assets/images/green-smoothie.jpg")}
              style={styles.shopImage}
            />
            <AppText>Green Smoothie</AppText>
            <AppText>$6</AppText>
          </View>
          <View style={styles.shopItem}>
            <Image
              source={require("../../assets/images/yoga-mat.jpg")}
              style={styles.shopImage}
            />
            <AppText>Yoga Mat</AppText>
            <AppText>$90</AppText>
          </View>
        </ScrollView>
      </View>

      {/* See all videos */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>See all videos</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {/* Ajouter les vignettes vidéos ici */}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
