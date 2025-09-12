import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { addPosition, createSession } from "../../services/api";

// --------------------
// Typages API
// --------------------
interface Session {
  id: number;
  startedAt?: string;
}

export default function SessionTracking() {
  const [tracking, setTracking] = useState(false);
  const [positions, setPositions] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [locationWatcher, setLocationWatcher] =
    useState<Location.LocationSubscription | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [safetyMode, setSafetyMode] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [calories, setCalories] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --------------------------
  // Stockage offline
  // --------------------------
  const saveOfflinePosition = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    if (!sessionId) return;
    try {
      const key = `offline_positions_session_${sessionId}`;
      const stored = await AsyncStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : [];
      parsed.push(coords);
      await AsyncStorage.setItem(key, JSON.stringify(parsed));
    } catch (e) {
      console.error("Erreur stockage offline", e);
    }
  };

  // --- Charger les données stockées au lancement ---
  useEffect(() => {
    (async () => {
      const storedPositions = await AsyncStorage.getItem("positions");
      if (storedPositions) setPositions(JSON.parse(storedPositions));

      const storedSafetyMode = await AsyncStorage.getItem("safetyMode");
      if (storedSafetyMode) setSafetyMode(JSON.parse(storedSafetyMode));

      const storedTime = await AsyncStorage.getItem("time");
      if (storedTime) setTime(parseInt(storedTime));

      const storedDistance = await AsyncStorage.getItem("distance");
      if (storedDistance) setDistance(parseFloat(storedDistance));

      const storedCalories = await AsyncStorage.getItem("calories");
      if (storedCalories) setCalories(parseFloat(storedCalories));

      const storedFirstName = await AsyncStorage.getItem("userFirstName");
      setFirstName(storedFirstName);

      // Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission GPS requise",
          "Activez la localisation pour continuer"
        );
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // --- Surveillance réseau ---
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // --- Start / Stop tracking ---
  const startTracking = async () => {
    try {
      const session: Session = await createSession();
      setSessionId(session.id);
      setTracking(true);

      // Timer
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          AsyncStorage.setItem("time", newTime.toString());
          return newTime;
        });
      }, 1000);

      // Location watcher
      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        async (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setPositions((prev) => {
            const newPositions = [...prev, coords];
            AsyncStorage.setItem("positions", JSON.stringify(newPositions));

            // Distance + calories
            if (newPositions.length > 1) {
              const last = newPositions[newPositions.length - 2];
              const curr = newPositions[newPositions.length - 1];
              const R = 6371e3;
              const φ1 = (last.latitude * Math.PI) / 180;
              const φ2 = (curr.latitude * Math.PI) / 180;
              const Δφ = ((curr.latitude - last.latitude) * Math.PI) / 180;
              const Δλ = ((curr.longitude - last.longitude) * Math.PI) / 180;
              const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) *
                  Math.cos(φ2) *
                  Math.sin(Δλ / 2) *
                  Math.sin(Δλ / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const d = (R * c) / 1000; // km
              const newDistance = distance + d;
              setDistance(newDistance);
              AsyncStorage.setItem("distance", newDistance.toString());

              // Calories pour femme ~60kg (MET approximatif 8)
              const caloriesBurned = newDistance * 60 * 8;
              setCalories(caloriesBurned);
              AsyncStorage.setItem("calories", caloriesBurned.toString());
            }
            return newPositions;
          });

          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          if (session.id) {
            try {
              if (isConnected)
                await addPosition(
                  session.id,
                  coords.latitude,
                  coords.longitude
                );
              else await saveOfflinePosition(coords);
            } catch {
              await saveOfflinePosition(coords);
            }
          }
        }
      );
      setLocationWatcher(watcher);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de démarrer la session.");
      console.error(error);
    }
  };

  const stopTracking = async () => {
    if (!sessionId) return;
    if (locationWatcher) locationWatcher.remove();
    if (timerRef.current) clearInterval(timerRef.current);

    setTracking(false);
    setSessionId(null);

    Alert.alert("Session terminée", "Votre parcours a été enregistré !");

    await AsyncStorage.multiRemove([
      "positions",
      "distance",
      "time",
      "calories",
    ]);
  };

  const toggleSafetyMode = async (value: boolean) => {
    setSafetyMode(value);
    await AsyncStorage.setItem("safetyMode", JSON.stringify(value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/wo-logo.png")}
          style={styles.logo}
        />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
        <View style={{ flex: 1, padding: 10 }}>
          <View style={{ flex: 1, backgroundColor: "#F5F0E8", padding: 16 }}>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Active Safety Check-in</Text>
              <Switch
                value={safetyMode}
                onValueChange={toggleSafetyMode}
                trackColor={{ false: "#ccc", true: "#A8D08D" }}
                thumbColor={safetyMode ? "#4CAF50" : "#f4f3f4"}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{distance.toFixed(2)} KM</Text>
                <Text style={styles.statLabel}>DISTANCE</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatTime(time)}</Text>
                <Text style={styles.statLabel}>TIME</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{calories.toFixed(0)}</Text>
                <Text style={styles.statLabel}>CALORIES</Text>
              </View>
            </View>

            <View style={styles.mapWrapper}>
              <MapView style={styles.map} region={region} showsUserLocation>
                {positions.length > 0 && (
                  <Polyline
                    coordinates={positions}
                    strokeWidth={4}
                    strokeColor="blue"
                  />
                )}
                {positions.length > 0 && (
                  <Marker coordinate={positions[positions.length - 1]} />
                )}
              </MapView>
            </View>

            {safetyMode && (
              <Pressable
                style={styles.sosContainer}
                onPressIn={() => {}}
                onPressOut={() => {}}
              >
                <View style={styles.sosCircle} />
                <Text style={styles.sosText}>Alerter mes proches</Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.startButton,
                { backgroundColor: tracking ? "#E91E63" : "#7DBA2D" },
              ]}
              onPress={tracking ? stopTracking : startTracking}
            >
              <Text style={styles.startButtonText}>
                {tracking ? "Stop Workout" : "Start Workout"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleLabel: { fontSize: 16, fontWeight: "500", color: "#D80800" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 14,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#222" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  mapWrapper: {
    height: 420,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#D0B06B",
    overflow: "hidden",
    marginVertical: 16,
  },
  map: { flex: 1 },
  startButton: {
    paddingVertical: 16,
    borderRadius: 29,
    alignItems: "center",
    marginTop: 10,
  },
  startButtonText: { color: "white", fontSize: 18, fontWeight: "700" },
  sosContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  sosCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D32F2F",
    marginRight: 10,
  },
  sosText: { fontSize: 16, fontWeight: "700", color: "#1E1E1E" },
  logoContainer: { width: "100%", alignItems: "center", marginTop: 10 },
  logo: { width: 150, height: 30, resizeMode: "contain" },
});
