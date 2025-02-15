import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import { Platform } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  useEffect(() => {
    const setNavBar = async () => {
      try {
        // ensures splash screen is visible during setup
        await SplashScreen.preventAutoHideAsync();
        // enables edge-to-edge mode
        await NavigationBar.setPositionAsync("absolute");
        // transparent backgrounds to see through
        await NavigationBar.setBackgroundColorAsync("#ffffff00");
      } catch (e) {
        console.warn("Error setting navigation bar:", e);
      } finally {
        if (fontsLoaded) {
          // hide splash screen once setup and fonts are complete
          await SplashScreen.hideAsync();
        }
      }
    };
    if (Platform.OS === "android") {
      setNavBar();
    }
  }, [fontsLoaded]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ThemedView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
        </Stack>
      </ThemedView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
