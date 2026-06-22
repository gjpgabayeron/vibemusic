import { useEffect } from "react";
import { useProfileStore } from "@/stores/profile-store";
import { useSettingsStore } from "@/stores/settings-store";
import { hexToHsl } from "@/lib/color-utils";
import { logger } from "@/lib/logger";

const THEME_VARS = [
  "primary",
  "primary-foreground",
  "accent",
  "accent-foreground",
  "ring",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-ring",
] as const;

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)} ${s}% ${l}%)`;
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function useProfileTheme() {
  const activeProfile = useProfileStore((s) => {
    const id = s.activeProfileId;
    return id ? s.profiles.find((p) => p.id === id) : undefined;
  });
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);

  useEffect(() => {
    const root = document.documentElement;
    const color = activeProfile?.color;

    const setOn = (el: HTMLElement, key: string, value: string) =>
      el.style.setProperty(`--${key}`, value);
    const removeOn = (el: HTMLElement, key: string) =>
      el.style.removeProperty(`--${key}`);

    const reset = () => {
      for (const v of THEME_VARS) {
        removeOn(root, v);
        for (const dark of document.querySelectorAll(".dark")) {
          removeOn(dark as HTMLElement, v);
        }
      }
    };

    if (!color || !isValidHex(color)) {
      reset();
      return;
    }

    const [h] = hexToHsl(color);
    if (typeof h !== "number" || isNaN(h)) {
      logger.warn("[theme] Invalid hue from profile color:", color);
      reset();
      return;
    }

    const isDark = resolvedTheme === "dark";

    const vars: Record<string, string> = isDark
      ? {
          "primary": hsl(h, 50, 65),
          "primary-foreground": hsl(0, 0, 10),
          "accent": hsl(h, 20, 20),
          "accent-foreground": hsl(h, 40, 80),
          "ring": hsl(h, 40, 55),
          "sidebar-primary": hsl(h, 55, 55),
          "sidebar-primary-foreground": hsl(0, 0, 10),
          "sidebar-ring": hsl(h, 35, 50),
        }
      : {
          "primary": hsl(h, 55, 45),
          "primary-foreground": hsl(0, 0, 100),
          "accent": hsl(h, 35, 94),
          "accent-foreground": hsl(h, 50, 30),
          "ring": hsl(h, 50, 55),
          "sidebar-primary": hsl(h, 50, 30),
          "sidebar-primary-foreground": hsl(0, 0, 100),
          "sidebar-ring": hsl(h, 45, 50),
        };

    const targets = [root, ...document.querySelectorAll<HTMLElement>(".dark")];

    for (const [key, value] of Object.entries(vars)) {
      for (const target of targets) {
        setOn(target, key, value);
      }
    }

    logger.debug("[theme] Applied profile color:", color, isDark ? "dark" : "light");

    return reset;
  }, [activeProfile?.color, resolvedTheme]);
}
