// Lets you play notes with the computer keyboard, laid out like a piano:
//
//    W E   T Y U
//   A S D F G H J K
//   C D E F G A B C
//
// Z / X shift the octave down / up.
const KEY_OFFSETS = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6,
  g: 7, y: 8, h: 9, u: 10, j: 11, k: 12,
};

export const DEFAULT_OCTAVE = 4; // 'a' = middle C (MIDI 60)
export const MIN_OCTAVE = 0;
export const MAX_OCTAVE = 8;

export function keyToMidiNote(key, octave = DEFAULT_OCTAVE) {
  if (typeof key !== 'string') return null;
  const offset = KEY_OFFSETS[key.toLowerCase()];
  if (offset === undefined) return null;
  return 12 * (octave + 1) + offset;
}

export function clampOctave(octave) {
  return Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, octave));
}
