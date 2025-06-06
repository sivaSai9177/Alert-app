/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Bubblegum Theme Color Palette
 */

// Bubblegum Theme Colors
const tintColorLight = '#ffc1cc'; // Bubblegum Pink
const tintColorDark = '#ff48a5'; // Bright Bubblegum Pink

export const Colors = {
  light: {
    text: '#4a1e2b', // Dark pink for text
    background: '#fff0f7', // Lavender Blush
    tint: tintColorLight,
    icon: '#d656b4', // Purple-pink
    tabIconDefault: '#fbbad8', // Cotton Candy
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffc1cc', // Light pink text
    background: '#2a1620', // Deep purple-pink background
    tint: tintColorDark,
    icon: '#ff77bc', // Medium pink
    tabIconDefault: '#d656b4', // Purple-pink
    tabIconSelected: tintColorDark,
  },
};
