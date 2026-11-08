import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PreviewProps = {
  label: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  upcoming: string[];
};

export function SectionPreview({
  label,
  title,
  description,
  icon,
  upcoming,
}: PreviewProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{label}</Text>

        <Text style={styles.heading}>{title}</Text>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={34} color="#D7B3FF" />
          </View>

          <Text style={styles.featureTitle}>
            Something wonderful is coming
          </Text>

          <Text style={styles.featureDescription}>
            We're building this part of StoryVerse to make
            discovering, reading and listening effortless.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>IN DEVELOPMENT</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What's coming next</Text>

        {upcoming.map((item) => (
          <View key={item} style={styles.listItem}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color="#CDA8FF"
            />

            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#090B12",
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CDA8FF",
    letterSpacing: 2,
    marginBottom: 10,
  },
  heading: {
    color: "#F8F5FF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  description: {
    color: "#AAA9BB",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  featureCard: {
    backgroundColor: "#141624",
    borderWidth: 1,
    borderColor: "#29283B",
    borderRadius: 24,
    padding: 26,
    marginTop: 32,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#302341",
    height: 78,
    width: 78,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  featureDescription: {
    color: "#A3A2B8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },
  badge: {
    backgroundColor: "#302341",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 24,
  },
  badgeText: {
    color: "#D7B3FF",
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 10,
  },
  sectionTitle: {
    color: "#F3F0FF",
    fontWeight: "700",
    fontSize: 18,
    marginTop: 34,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#141624",
    borderRadius: 15,
    padding: 17,
    marginBottom: 10,
  },
  listText: {
    color: "#D6D4E3",
    fontSize: 14,
    flex: 1,
  },
});