import { Music, CircleUser, ChartColumn, Shield } from "lucide-react";
import FeatureCard from "@/components/feature-card";

const features = [
  {
    icon: Music,
    title: "Multi-Format Playback",
    desc: "MP3, FLAC, OGG, M4A, AAC, WAV, AIFF — no conversion needed.",
  },
  {
    icon: CircleUser,
    title: "Multi-Profile System",
    desc: "Share one computer. Every profile gets its own library and playlists.",
  },
  {
    icon: ChartColumn,
    title: "Listening Insights",
    desc: "Tracks, trends, streaks, weekly wraps. See your listening habits.",
  },
  {
    icon: Shield,
    title: "100% Private",
    desc: "No cloud, no ads, no tracking. Your music stays on your machine.",
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full">
      {features.map((f, i) => (
        <FeatureCard
          key={f.title}
          icon={f.icon}
          title={f.title}
          desc={f.desc}
          delay={`animation-delay-${(i + 2) * 100}`}
        />
      ))}
    </div>
  );
}
