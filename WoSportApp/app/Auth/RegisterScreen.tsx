import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, ScrollView, Text, TextInput } from "react-native";
import { loginUser, registerUser, User } from "../../services/api";
import { setItem } from "../../services/storage";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    if (
      !form.first_name ||
      !form.email ||
      !form.password ||
      !form.password_confirmation
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (form.password !== form.password_confirmation) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Création de l'utilisateur
      const res = await registerUser(form);

      if (!res.user) throw new Error("User creation failed");

      // Auto-login
      const loginData: User = await loginUser(form.email, form.password);

      // await setItem("userToken", loginData.token);
      await setItem("userFirstName", loginData.first_name);

      // Redirection vers Home
      // router.replace("./Home");
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text>First Name</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={form.first_name}
        onChangeText={(v) => handleChange("first_name", v)}
      />

      <Text>Last Name</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={form.last_name}
        onChangeText={(v) => handleChange("last_name", v)}
      />

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={form.email}
        onChangeText={(v) => handleChange("email", v)}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text>Password</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={form.password}
        onChangeText={(v) => handleChange("password", v)}
        secureTextEntry
      />

      <Text>Confirm Password</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={form.password_confirmation}
        onChangeText={(v) => handleChange("password_confirmation", v)}
        secureTextEntry
      />

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />
    </ScrollView>
  );
}
