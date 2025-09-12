import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useUser } from "../../context/UserContext";
import { getCurrentUser } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const userContext = useUser();
  if (!userContext) throw new Error("UserContext not available");
  const { login, currentUser } = userContext;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log("[LoginScreen] Attempt login with:", email, password);
      await login(email, password);

      const storedUser = await getCurrentUser();
      console.log(
        "[LoginScreen] Login success, user from storage:",
        storedUser
      );

      console.log("[LoginScreen] Login success, currentUser:", currentUser);

      // Redirection vers Home
      router.replace("/screens/Home");
    } catch (err: any) {
      console.error("[LoginScreen] Login failed:", err);
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text>Password</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />

      <Button
        title="No account? Register"
        onPress={() => router.push("/Auth/RegisterScreen")}
      />
    </View>
  );
}
