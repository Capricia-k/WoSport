import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/AppText";
import Header from "../../components/Header";
import { useUser } from "../../context/UserContext";
import { createCycle, getCycles } from "../../services/cycles";
import {
  cyclePhaseMessages,
  getCyclePhase,
} from "../../services/cyclesMessages";

type Cycle = {
  id: number;
  start_date: string;
  end_date: string;
  symptoms?: Record<string, boolean>;
  notes?: string;
};

export default function Cycles() {
  const currentUser = useUser();
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});

  useEffect(() => {
    if (!currentUser) {
      console.log("User non connecté !");
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const data = await getCycles();
        setCycles(data as Cycle[]); // 🔹 cast ici
      } catch (error) {
        console.error("Error fetching cycles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    const start = new Date(day.dateString);
    const marks: { [date: string]: any } = {};

    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateString = d.toISOString().split("T")[0];

      marks[dateString] = {
        selected: true,
        selectedColor: i === 0 ? "#e6d3b3" : "rgba(230,211,179,0.4)",
        marked: true,
      };
    }

    setMarkedDates(marks);
  };

  const handleCreateCycle = async () => {
    if (!selectedDate) {
      alert("Sélectionnez une date de début");
      return;
    }
    setCreating(true);
    try {
      const start = new Date(selectedDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 4);

      await createCycle({
        start_date: selectedDate,
        end_date: end.toISOString().split("T")[0],
        notes,
      });

      const updatedCycles = await getCycles();
      setCycles(updatedCycles as Cycle[]);

      setSelectedDate("");
      setNotes("");
      alert("Cycle créé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du cycle.");
    } finally {
      setCreating(false);
    }
  };

  const renderCycle = (item: Cycle) => {
    const phase = getCyclePhase(item.start_date);
    const { title, text } = cyclePhaseMessages[phase];

    return (
      <View style={styles.cycleCard} key={item.id}>
        <AppText style={styles.cycleDates}>
          {item.start_date} - {item.end_date || "En cours"}
        </AppText>
        <AppText style={styles.phaseText}>{phase.toUpperCase()}</AppText>

        <View style={styles.recommendationBox}>
          <AppText style={styles.recommendationTitle}>{title}</AppText>
          <AppText style={styles.recommendationText}>{text}</AppText>
          <View style={styles.iconsRow}>
            <MaterialCommunityIcons
              name="weather-night"
              size={20}
              color="#bfae90"
            />
            <MaterialCommunityIcons name="water" size={20} color="#bfae90" />
            <MaterialCommunityIcons
              name="emoticon-neutral-outline"
              size={20}
              color="#bfae90"
            />
          </View>
        </View>

        {item.notes && (
          <View style={styles.encouragementBox}>
            <AppText style={styles.encouragementText}>{item.notes}</AppText>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <AppText>Loading cycles...</AppText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <SafeAreaView style={{ backgroundColor: "#F5F0E8" }}>
        <Header />
      </SafeAreaView>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#e6d3b3",
          todayTextColor: "#a67c52",
          arrowColor: "#a67c52",
        }}
        style={{ borderRadius: 16, marginVertical: 16 }}
      />

      <TextInput
        placeholder="Notes (optionnel)"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
      />
      <Button
        title={creating ? "Création..." : "Ajouter le cycle"}
        onPress={handleCreateCycle}
        disabled={creating}
      />

      {cycles.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Aucun cycle pour l’instant
        </Text>
      )}

      {cycles.map(renderCycle)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
  },
  cycleCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fff8f0",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cycleDates: { fontSize: 16, color: "#555" },
  phaseText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a67c52",
    marginVertical: 8,
  },
  recommendationBox: {
    backgroundColor: "#fdf1e6",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#8c6d4b",
  },
  recommendationText: { fontSize: 14, color: "#555" },
  iconsRow: { flexDirection: "row", marginTop: 8, gap: 12 },
  encouragementBox: {
    backgroundColor: "#fdf1e6",
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  encouragementText: { fontSize: 14, color: "#555" },
});
