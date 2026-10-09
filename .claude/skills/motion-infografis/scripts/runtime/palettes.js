// Palette library. Styles and palettes are only ever added, never removed: every reference the user sends keeps its
// palette here so parts of a video can be combined for variety. "jundy" is the locked default for this skill.
export const PALETTES = {
  // locked default: jundy-aljihad.vercel.app (app/globals.css, GradientBlob hero, .text-gradient)
  jundy: { bg: '#06050A', surface: '#0B0A12', ink: '#F5F3FF', accent: '#A78BFA', accent2: '#FB923C', accent3: '#F472B6',
    pos: '#34D399', neg: '#FB7185', glass: 'rgba(11, 10, 18, 0.84)', glow: ['#7C3AED', '#DB2777'] },
  // original house style (SIAGA SUMATRA): navy / teal / amber
  navy: { bg: '#0A1E36', surface: '#12355B', ink: '#FFFFFF', accent: '#3FB6C4', accent2: '#E0A100', accent3: '#90AC62', // accent3 = teal/amber midpoint, so gradients match the original 2-stop look
    pos: '#5DBB63', neg: '#F06A5F', glass: 'rgba(10, 30, 54, 0.84)', glow: ['#12355B', '#3FB6C4'] },
  // kinetic collage reference (ref B) and its variants
  maroon: { bg: '#4E1A26', surface: '#5E2330', ink: '#EFDCCB', accent: '#F2B45A', accent2: '#F2B45A', accent3: '#E88A6A',
    pos: '#9CCB7A', neg: '#F27B6B', glass: 'rgba(58, 18, 28, 0.86)', glow: ['#7A2A3A', '#A0463A'] },
  paper: { bg: '#EFE6D8', surface: '#E4D8C4', ink: '#1F1B18', accent: '#C23B22', accent2: '#C23B22', accent3: '#8A5A2B',
    pos: '#3F7D3A', neg: '#B3261E', glass: 'rgba(239, 230, 216, 0.9)', glow: ['#D9C7A8', '#E8B9A0'] },
  ink: { bg: '#111111', surface: '#1B1B1B', ink: '#F4F1EA', accent: '#F2C94C', accent2: '#F2C94C', accent3: '#EB5757',
    pos: '#6FCF97', neg: '#EB5757', glass: 'rgba(17, 17, 17, 0.86)', glow: ['#2B2B2B', '#3A3320'] },
  // blueprint / isometric references (ref a light, ref b dark) and the graph-paper whiteboard reference (ref e)
  frost: { bg: '#EEF1F7', surface: '#FFFFFF', ink: '#0B1220', accent: '#2B3FD6', accent2: '#FF5A36', accent3: '#6B7CFF',
    pos: '#1F9D63', neg: '#D92D20', glass: 'rgba(255, 255, 255, 0.92)', glow: ['#DDE4F5', '#EEF1F7'] },
  blueprint: { bg: '#03050D', surface: '#0A1230', ink: '#E8EEFF', accent: '#4C6BFF', accent2: '#9DB4FF', accent3: '#2A3E9C',
    pos: '#34D399', neg: '#FB7185', glass: 'rgba(10, 18, 48, 0.88)', glow: ['#102A7A', '#0A1230'] },
  graph: { bg: '#EDEDEA', surface: '#FFFFFF', ink: '#0F0F0F', accent: '#D32F2F', accent2: '#D32F2F', accent3: '#555555',
    pos: '#2E7D32', neg: '#D32F2F', glass: 'rgba(237, 237, 234, 0.94)', glow: ['#E0E0DC', '#EDEDEA'] },
};
export const TOKENS = ['bg', 'surface', 'ink', 'accent', 'accent2', 'accent3', 'pos', 'neg', 'glass'];

// set palette tokens as CSS variables on an element (document root, or one beat's layer for a per-part palette)
export function applyPalette(style, pal) {
  for (const k of TOKENS) if (pal[k] != null) style.setProperty(`--${k}`, pal[k]);
}
