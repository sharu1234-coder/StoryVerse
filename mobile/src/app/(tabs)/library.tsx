import { SectionPreview } from "../../components/section-preview";

export default function LibraryScreen() {
  return (
    <SectionPreview
      label="YOUR PERSONAL COLLECTION"
      title="My Library"
      description="Your favorite stories and unforgettable characters, all in one place."
      icon="bookmarks-outline"
      upcoming={[
        "Saved stories and personal reading lists",
        "Continue reading and listening",
        "Reading and listening history",
        "Offline downloads for eligible stories",
      ]}
    />
  );
}