import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StoryVerseTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D7B3FF",
        tabBarInactiveTintColor: "#88899E",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: "#10121C",
          borderTopColor: "#29283B",
          borderTopWidth: 1,
          height: 62 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.activeIcon]}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? "#D7B3FF" : "#88899E"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.activeIcon]}>
              <Ionicons
                name={focused ? "compass" : "compass-outline"}
                size={22}
                color={focused ? "#D7B3FF" : "#88899E"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.activeIcon]}>
              <Ionicons
                name={focused ? "bookmarks" : "bookmarks-outline"}
                size={22}
                color={focused ? "#D7B3FF" : "#88899E"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconBox, focused && styles.activeIcon]}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={focused ? "#D7B3FF" : "#88899E"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 46,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIcon: {
    backgroundColor: "#302341",
  },
});