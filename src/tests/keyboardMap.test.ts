import { describe, it, expect } from 'vitest';
import { keyToMidiNote, clampOctave } from '../midi/keyboardMap';
import { midiNoteToName } from '../midi/noteNames';

describe('keyToMidiNote', () => {
  it('maps the home row to a C major scale starting on middle C', () => {
    const notes = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'].map((k) => keyToMidiNote(k));
    expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
  });

  it('maps the top row to sharps', () => {
    expect(['w', 'e', 't', 'y', 'u'].map((k) => keyToMidiNote(k))).toEqual([61, 63, 66, 68, 70]);
  });

  it('shifts by octave', () => {
    expect(keyToMidiNote('a', 3)).toBe(48);
    expect(keyToMidiNote('a', 5)).toBe(72);
  });

  it('is case-insensitive and ignores unmapped keys', () => {
    expect(keyToMidiNote('A')).toBe(60);
    expect(keyToMidiNote('q')).toBeNull();
    expect(keyToMidiNote('Enter')).toBeNull();
  });

  it('clamps octaves to the playable range', () => {
    expect(clampOctave(-1)).toBe(0);
    expect(clampOctave(9)).toBe(8);
    expect(clampOctave(4)).toBe(4);
  });
});

describe('midiNoteToName', () => {
  it('names notes with their octave', () => {
    expect(midiNoteToName(60)).toBe('C4');
    expect(midiNoteToName(61)).toBe('C#4');
    expect(midiNoteToName(21)).toBe('A0');
    expect(midiNoteToName(108)).toBe('C8');
  });
});
