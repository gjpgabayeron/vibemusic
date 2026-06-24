import { useEffect, useState } from "react";
import homepageImg from "@/assets/features/homepage.png";
import lyricsImg from "@/assets/features/lyrics.png";
import insightsImg from "@/assets/features/insights.png";

const images = [
  { src: homepageImg, alt: "VibeMusic player interface" },
  { src: lyricsImg, alt: "VibeMusic lyrics view" },
  { src: insightsImg, alt: "VibeMusic listening insights" },
];

export default function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          className={`absolute inset-0 w-fit h-full object-contain transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
