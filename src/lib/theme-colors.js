/**
 * Hex equivalents of the theme tokens in globals.css, for React Bits components
 * that parse colours themselves (WebGL shaders, canvas, gradient text) and so
 * cannot read CSS variables.
 */
export const THEME_HEX = {
  light: {
    foreground: "#141822",
    mutedForeground: "#5d636f",
    primary: "#4f46e5",
    card: "#ffffff",
    accept: "#007653",
    reject: "#cc103d",
    sky: "#0086b9",
  },
  dark: {
    foreground: "#f4f5f7",
    mutedForeground: "#a0a5ae",
    primary: "#808aff",
    card: "#13161c",
    accept: "#3cc998",
    reject: "#f96e7f",
    sky: "#4eb8e9",
  },
};
