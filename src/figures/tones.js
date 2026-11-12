export const TONES = ['good', 'baseline', 'bad', 'warn', 'accent', 'good-soft'];

export function toneOf(item, index) {
  return (item && item.tone) || TONES[index % TONES.length];
}
