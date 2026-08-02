import type { Metadata } from "next";
import LevelEditor from "./LevelEditor";

export const metadata: Metadata = {
  title: "Puzzle Level Editor",
  description: "Create printable Spot the Difference puzzle and answer pages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LevelEditorPage() {
  return <LevelEditor />;
}
