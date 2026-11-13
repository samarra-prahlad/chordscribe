const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 60 -> "C4", 61 -> "C#4"
export function midiNoteToName(note) {
  const octave = Math.floor(note / 12) - 1;
  return `${NAMES[note % 12]}${octave}`;
}
