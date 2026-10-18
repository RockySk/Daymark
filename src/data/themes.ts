export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  light: ThemePalette;
  dark: ThemePalette;
}

interface ThemePalette {
  primary: string;
  primaryRgb: string;
  primaryContrast: string;
  primaryContrastRgb: string;
  primaryShade: string;
  primaryTint: string;
  pageGradient: string;
  fabGlow: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "purple",
    name: "Purple Bloom",
    emoji: "💜",
    light: {
      primary: "#6750a4",
      primaryRgb: "103, 80, 164",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#5b4690",
      primaryTint: "#8b78c4",
      pageGradient: "linear-gradient(160deg, #f8f0ff 0%, #ede6f5 50%, #e4ddef 100%)",
      fabGlow: "rgba(103, 80, 164, 0.35)",
    },
    dark: {
      primary: "#d0bcff",
      primaryRgb: "208, 188, 255",
      primaryContrast: "#381e72",
      primaryContrastRgb: "56, 30, 114",
      primaryShade: "#b7a5e0",
      primaryTint: "#dccfff",
      pageGradient: "linear-gradient(160deg, #1a1625 0%, #12101a 50%, #0f0d14 100%)",
      fabGlow: "rgba(208, 188, 255, 0.25)",
    },
  },
  {
    id: "ocean",
    name: "Ocean Teal",
    emoji: "🌊",
    light: {
      primary: "#006a6a",
      primaryRgb: "0, 106, 106",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#005d5d",
      primaryTint: "#2a8a8a",
      pageGradient: "linear-gradient(160deg, #e6fffe 0%, #d4f5f3 50%, #c5ede9 100%)",
      fabGlow: "rgba(0, 106, 106, 0.35)",
    },
    dark: {
      primary: "#4fd8d8",
      primaryRgb: "79, 216, 216",
      primaryContrast: "#003737",
      primaryContrastRgb: "0, 55, 55",
      primaryShade: "#46bebe",
      primaryTint: "#6ee0e0",
      pageGradient: "linear-gradient(160deg, #0f1f1f 0%, #0a1818 50%, #071414 100%)",
      fabGlow: "rgba(79, 216, 216, 0.25)",
    },
  },
  {
    id: "rose",
    name: "Sunset Rose",
    emoji: "🌹",
    light: {
      primary: "#b5446e",
      primaryRgb: "181, 68, 110",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#9e3c61",
      primaryTint: "#c46088",
      pageGradient: "linear-gradient(160deg, #fff0f5 0%, #f9e4ec 50%, #f2d6e2 100%)",
      fabGlow: "rgba(181, 68, 110, 0.35)",
    },
    dark: {
      primary: "#ffb1c8",
      primaryRgb: "255, 177, 200",
      primaryContrast: "#5e1133",
      primaryContrastRgb: "94, 17, 51",
      primaryShade: "#e09db0",
      primaryTint: "#ffc2d4",
      pageGradient: "linear-gradient(160deg, #201218 0%, #1a0e14 50%, #150a10 100%)",
      fabGlow: "rgba(255, 177, 200, 0.25)",
    },
  },
  {
    id: "forest",
    name: "Forest Green",
    emoji: "🌿",
    light: {
      primary: "#386a20",
      primaryRgb: "56, 106, 32",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#315d1c",
      primaryTint: "#4c7936",
      pageGradient: "linear-gradient(160deg, #f0f9ec 0%, #e2f0dc 50%, #d5e8cf 100%)",
      fabGlow: "rgba(56, 106, 32, 0.35)",
    },
    dark: {
      primary: "#9ed47e",
      primaryRgb: "158, 212, 126",
      primaryContrast: "#0d3900",
      primaryContrastRgb: "13, 57, 0",
      primaryShade: "#8bbb6f",
      primaryTint: "#b0dc95",
      pageGradient: "linear-gradient(160deg, #121f0e 0%, #0e180a 50%, #0a1207 100%)",
      fabGlow: "rgba(158, 212, 126, 0.25)",
    },
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    emoji: "🌙",
    light: {
      primary: "#3558a0",
      primaryRgb: "53, 88, 160",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#2e4d8c",
      primaryTint: "#5070b5",
      pageGradient: "linear-gradient(160deg, #edf2ff 0%, #dfe6f8 50%, #d0dbf2 100%)",
      fabGlow: "rgba(53, 88, 160, 0.35)",
    },
    dark: {
      primary: "#aec6ff",
      primaryRgb: "174, 198, 255",
      primaryContrast: "#0a2d6b",
      primaryContrastRgb: "10, 45, 107",
      primaryShade: "#99afe0",
      primaryTint: "#c0d2ff",
      pageGradient: "linear-gradient(160deg, #101828 0%, #0c1220 50%, #080e18 100%)",
      fabGlow: "rgba(174, 198, 255, 0.25)",
    },
  },
  {
    id: "amber",
    name: "Amber Gold",
    emoji: "✨",
    light: {
      primary: "#8b5e00",
      primaryRgb: "139, 94, 0",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#7a5300",
      primaryTint: "#a07520",
      pageGradient: "linear-gradient(160deg, #fff8eb 0%, #f7edda 50%, #f0e4cc 100%)",
      fabGlow: "rgba(139, 94, 0, 0.35)",
    },
    dark: {
      primary: "#f5c342",
      primaryRgb: "245, 195, 66",
      primaryContrast: "#462b00",
      primaryContrastRgb: "70, 43, 0",
      primaryShade: "#d8ab3a",
      primaryTint: "#f7cd5e",
      pageGradient: "linear-gradient(160deg, #1e1808 0%, #181206 50%, #120e04 100%)",
      fabGlow: "rgba(245, 195, 66, 0.25)",
    },
  },
  {
    id: "coral",
    name: "Coral Reef",
    emoji: "🪸",
    light: {
      primary: "#c4441d",
      primaryRgb: "196, 68, 29",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#ac3c1a",
      primaryTint: "#d06040",
      pageGradient: "linear-gradient(160deg, #fff1ed 0%, #fbe3db 50%, #f5d4c9 100%)",
      fabGlow: "rgba(196, 68, 29, 0.35)",
    },
    dark: {
      primary: "#ffb4a0",
      primaryRgb: "255, 180, 160",
      primaryContrast: "#5c1900",
      primaryContrastRgb: "92, 25, 0",
      primaryShade: "#e09e8c",
      primaryTint: "#ffc4b5",
      pageGradient: "linear-gradient(160deg, #201410 0%, #180e0a 50%, #120907 100%)",
      fabGlow: "rgba(255, 180, 160, 0.25)",
    },
  },
  {
    id: "lavender",
    name: "Lavender Mist",
    emoji: "💐",
    light: {
      primary: "#8b5cf6",
      primaryRgb: "139, 92, 246",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#7a51d8",
      primaryTint: "#a07af8",
      pageGradient: "linear-gradient(160deg, #f5f0ff 0%, #ebe3fb 50%, #e0d6f7 100%)",
      fabGlow: "rgba(139, 92, 246, 0.35)",
    },
    dark: {
      primary: "#c4b5fd",
      primaryRgb: "196, 181, 253",
      primaryContrast: "#3b1f8a",
      primaryContrastRgb: "59, 31, 138",
      primaryShade: "#ac9fe0",
      primaryTint: "#d0c4fe",
      pageGradient: "linear-gradient(160deg, #161028 0%, #100c1e 50%, #0b0816 100%)",
      fabGlow: "rgba(196, 181, 253, 0.25)",
    },
  },
  {
    id: "cherry",
    name: "Cherry Red",
    emoji: "🍒",
    light: {
      primary: "#c62828",
      primaryRgb: "198, 40, 40",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#ae2323",
      primaryTint: "#d04444",
      pageGradient: "linear-gradient(160deg, #fff0f0 0%, #fce0e0 50%, #f8d0d0 100%)",
      fabGlow: "rgba(198, 40, 40, 0.35)",
    },
    dark: {
      primary: "#ff8a80",
      primaryRgb: "255, 138, 128",
      primaryContrast: "#6e0000",
      primaryContrastRgb: "110, 0, 0",
      primaryShade: "#e07a70",
      primaryTint: "#ff9e95",
      pageGradient: "linear-gradient(160deg, #201010 0%, #180a0a 50%, #120707 100%)",
      fabGlow: "rgba(255, 138, 128, 0.25)",
    },
  },
  {
    id: "slate",
    name: "Slate Grey",
    emoji: "🌫️",
    light: {
      primary: "#4a5568",
      primaryRgb: "74, 85, 104",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#414b5c",
      primaryTint: "#5e6b7e",
      pageGradient: "linear-gradient(160deg, #f0f2f5 0%, #e5e8ec 50%, #d9dde3 100%)",
      fabGlow: "rgba(74, 85, 104, 0.35)",
    },
    dark: {
      primary: "#a0aec0",
      primaryRgb: "160, 174, 192",
      primaryContrast: "#1a202c",
      primaryContrastRgb: "26, 32, 44",
      primaryShade: "#8c99a9",
      primaryTint: "#b0bac8",
      pageGradient: "linear-gradient(160deg, #141820 0%, #0e1218 50%, #0a0e12 100%)",
      fabGlow: "rgba(160, 174, 192, 0.25)",
    },
  },
  {
    id: "peach",
    name: "Peach Blush",
    emoji: "🍑",
    light: {
      primary: "#d97706",
      primaryRgb: "217, 119, 6",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#bf6905",
      primaryTint: "#e08e28",
      pageGradient: "linear-gradient(160deg, #fff7ed 0%, #ffecd5 50%, #ffdfc0 100%)",
      fabGlow: "rgba(217, 119, 6, 0.35)",
    },
    dark: {
      primary: "#fbbf24",
      primaryRgb: "251, 191, 36",
      primaryContrast: "#533200",
      primaryContrastRgb: "83, 50, 0",
      primaryShade: "#dda820",
      primaryTint: "#fcc940",
      pageGradient: "linear-gradient(160deg, #1e1608 0%, #181006 50%, #120c04 100%)",
      fabGlow: "rgba(251, 191, 36, 0.25)",
    },
  },
  {
    id: "indigo",
    name: "Indigo Night",
    emoji: "🔮",
    light: {
      primary: "#4338ca",
      primaryRgb: "67, 56, 202",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#3b31b2",
      primaryTint: "#5850d4",
      pageGradient: "linear-gradient(160deg, #eef0ff 0%, #e0e3fb 50%, #d2d5f7 100%)",
      fabGlow: "rgba(67, 56, 202, 0.35)",
    },
    dark: {
      primary: "#a5b4fc",
      primaryRgb: "165, 180, 252",
      primaryContrast: "#1e1b6e",
      primaryContrastRgb: "30, 27, 110",
      primaryShade: "#919fe0",
      primaryTint: "#b5c1fd",
      pageGradient: "linear-gradient(160deg, #0e0e28 0%, #0a0a1e 50%, #070716 100%)",
      fabGlow: "rgba(165, 180, 252, 0.25)",
    },
  },
  {
    id: "mint",
    name: "Mint Fresh",
    emoji: "🌱",
    light: {
      primary: "#059669",
      primaryRgb: "5, 150, 105",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#04845c",
      primaryTint: "#20a67a",
      pageGradient: "linear-gradient(160deg, #ecfdf5 0%, #d5f5e8 50%, #c0eddc 100%)",
      fabGlow: "rgba(5, 150, 105, 0.35)",
    },
    dark: {
      primary: "#6ee7b7",
      primaryRgb: "110, 231, 183",
      primaryContrast: "#003d22",
      primaryContrastRgb: "0, 61, 34",
      primaryShade: "#61cca1",
      primaryTint: "#82ebc3",
      pageGradient: "linear-gradient(160deg, #0c1e18 0%, #081612 50%, #05100c 100%)",
      fabGlow: "rgba(110, 231, 183, 0.25)",
    },
  },
  {
    id: "wine",
    name: "Wine Burgundy",
    emoji: "🍷",
    light: {
      primary: "#881337",
      primaryRgb: "136, 19, 55",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#781130",
      primaryTint: "#9a2b4f",
      pageGradient: "linear-gradient(160deg, #fef0f4 0%, #f8dfe6 50%, #f2cfd8 100%)",
      fabGlow: "rgba(136, 19, 55, 0.35)",
    },
    dark: {
      primary: "#fda4af",
      primaryRgb: "253, 164, 175",
      primaryContrast: "#4c0519",
      primaryContrastRgb: "76, 5, 25",
      primaryShade: "#df909a",
      primaryTint: "#fdb5be",
      pageGradient: "linear-gradient(160deg, #200e14 0%, #180a0e 50%, #12070a 100%)",
      fabGlow: "rgba(253, 164, 175, 0.25)",
    },
  },
  {
    id: "sky",
    name: "Sky Blue",
    emoji: "☁️",
    light: {
      primary: "#0284c7",
      primaryRgb: "2, 132, 199",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#0274af",
      primaryTint: "#1e94d0",
      pageGradient: "linear-gradient(160deg, #e8f6ff 0%, #d4ecfa 50%, #c0e2f5 100%)",
      fabGlow: "rgba(2, 132, 199, 0.35)",
    },
    dark: {
      primary: "#7dd3fc",
      primaryRgb: "125, 211, 252",
      primaryContrast: "#003a5c",
      primaryContrastRgb: "0, 58, 92",
      primaryShade: "#6ebade",
      primaryTint: "#92dafd",
      pageGradient: "linear-gradient(160deg, #0a1620 0%, #071018 50%, #050c12 100%)",
      fabGlow: "rgba(125, 211, 252, 0.25)",
    },
  },
  {
    id: "charcoal",
    name: "Charcoal Dark",
    emoji: "🖤",
    light: {
      primary: "#1f2937",
      primaryRgb: "31, 41, 55",
      primaryContrast: "#ffffff",
      primaryContrastRgb: "255, 255, 255",
      primaryShade: "#1b2430",
      primaryTint: "#374151",
      pageGradient: "linear-gradient(160deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)",
      fabGlow: "rgba(31, 41, 55, 0.35)",
    },
    dark: {
      primary: "#d1d5db",
      primaryRgb: "209, 213, 219",
      primaryContrast: "#111827",
      primaryContrastRgb: "17, 24, 39",
      primaryShade: "#b8bcc1",
      primaryTint: "#d9dce1",
      pageGradient: "linear-gradient(160deg, #111827 0%, #0c1018 50%, #080c12 100%)",
      fabGlow: "rgba(209, 213, 219, 0.2)",
    },
  },
];

export function findTheme(id: string): AppTheme {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0];
}

export function applyTheme(theme: AppTheme): void {
  const isDark = document.body.classList.contains("dark");
  const palette = isDark ? theme.dark : theme.light;
  const root = document.documentElement;

  root.style.setProperty("--ion-color-primary", palette.primary);
  root.style.setProperty("--ion-color-primary-rgb", palette.primaryRgb);
  root.style.setProperty("--ion-color-primary-contrast", palette.primaryContrast);
  root.style.setProperty("--ion-color-primary-contrast-rgb", palette.primaryContrastRgb);
  root.style.setProperty("--ion-color-primary-shade", palette.primaryShade);
  root.style.setProperty("--ion-color-primary-tint", palette.primaryTint);
  root.style.setProperty("--page-gradient", palette.pageGradient);
  root.style.setProperty("--accent-gradient",
    `linear-gradient(135deg, ${palette.primary}, ${palette.primaryTint})`
  );

  const fabBtn = document.querySelector("ion-fab-button");
  if (fabBtn) {
    (fabBtn as HTMLElement).style.setProperty("--box-shadow", `0 6px 20px ${palette.fabGlow}`);
  }
}
