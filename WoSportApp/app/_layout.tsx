import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { UserProvider, useUser } from "../context/UserContext";
import { getUnreadMessagesCount } from "../services/api";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const userContext = useUser();
  const { currentUser } = userContext;
  const router = useRouter();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [fontsLoaded] = useFonts({
    IowanOldStyle: require("../assets/fonts/IowanOldStyleBT-Roman.otf"),
  });

  // 🔹 Badge messages non lus
  useEffect(() => {
    if (!currentUser) return;

    const fetchUnread = async () => {
      try {
        const data = await getUnreadMessagesCount();
        setUnreadCount(data.unread_count || 0);
      } catch (err) {
        console.error("Erreur badge messages :", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // 🔹 Notifications push
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification reçue:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification action:", response);
        router.push("/screens/social/Inbox");
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="Auth/LoginScreen" options={{ title: "Login" }} />
      <Stack.Screen
        name="Auth/RegisterScreen"
        options={{ title: "Register" }}
      />
      <Stack.Screen name="screens/Cycles" options={{ title: "Cycles" }} />
      <Stack.Screen name="screens/Profile" options={{ title: "Profile" }} />
      <Stack.Screen
        name="screens/social/SocialFeed"
        options={{ title: "Social Feed" }}
      />
      <Stack.Screen
        name="screens/social/UserProfile"
        options={{ title: "UserProfile" }}
      />
      <Stack.Screen
        name="screens/social/MyProfile"
        options={{ title: "MyProfile" }}
      />
      <Stack.Screen
        name="screens/EditProfile"
        options={{ title: "EditProfile" }}
      />
      <Stack.Screen
        name="screens/social/Inbox"
        options={{ title: `Inbox${unreadCount ? ` (${unreadCount})` : ""}` }}
      />
      <Stack.Screen
        name="screens/social/NewMessage"
        options={{ title: "New Message" }}
      />
      <Stack.Screen
        name="screens/social/SendPost"
        options={{ title: "Send Post" }}
      />
      <Stack.Screen
        name="screens/social/SelectUser"
        options={{ title: "Select User" }}
      />
      <Stack.Screen
        name="screens/social/AddStory"
        options={{ title: "Add Story" }}
      />
      <Stack.Screen
        name="screens/social/ViewStory"
        options={{ title: "View Story" }}
      />
      <Stack.Screen
        name="screens/social/story/[userId]"
        options={{ title: "User Id" }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
