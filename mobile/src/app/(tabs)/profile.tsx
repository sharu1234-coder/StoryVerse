import { SectionPreview } from "../../components/section-preview";

export default function ProfileScreen() {
  return (
    <SectionPreview
      label="YOUR STORYVERSE ACCOUNT"
      title="My Profile"
      description="Your personal space for reading preferences, listening habits and membership."
      icon="person-outline"
      upcoming={[
        "Secure signup and login",
        "Language and accessibility preferences",
        "Membership and payment management",
        "Notifications, privacy and account controls",
      ]}
    />
  );
}