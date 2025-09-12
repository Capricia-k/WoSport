import { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialHeader from "../../components/SocialHeader";
import { useUser } from "../../context/UserContext";
import { updateUserProfile } from "../../services/api";

export default function ProfileSettingsScreen() {
  const { currentUser, updateCurrentUser } = useUser();

  const [firstName, setFirstName] = useState(currentUser?.first_name || "");
  const [lastName, setLastName] = useState(currentUser?.last_name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentUser?.token) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    setLoading(true);
    try {
      const updatedUserRaw = await updateUserProfile(currentUser.token, {
        first_name: firstName,
        last_name: lastName,
        bio,
      });

      await updateCurrentUser({
        first_name: updatedUserRaw.first_name,
        last_name: updatedUserRaw.last_name,
        bio: updatedUserRaw.bio,
      });

      Alert.alert(
        "Profil mis à jour ✅",
        "Vos informations ont été enregistrées"
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <SocialHeader />
      </SafeAreaView>

      <Text style={styles.label}>Prénom</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Prénom"
      />

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Nom"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={bio}
        onChangeText={setBio}
        placeholder="Quelques mots sur vous"
        multiline
      />

      <Button
        title={loading ? "Enregistrement..." : "Enregistrer"}
        onPress={handleSave}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fff",
  },
});
