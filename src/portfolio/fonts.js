// next/font gives the fonts generated family names, exposed as CSS variables on
// <html>. Canvas text (monitor, poster, neon sign) needs the real names.
const fontVar = (name, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value ? `${value}, ${fallback}` : fallback;
};

export const SANS = fontVar('--font-inter', 'Inter, system-ui, sans-serif');
export const MONO = fontVar('--font-mono', '"JetBrains Mono", ui-monospace, monospace');
