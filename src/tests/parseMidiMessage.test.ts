import { describe, it, expect } from 'vitest';
import { parseMidiMessage } from '../midi/parseMidiMessage';

describe('parseMidiMessage', () => {
  it('parses a note-on on channel 1', () => {
    expect(parseMidiMessage([144, 60, 100])).toEqual({ type: 'noteOn', note: 60, velocity: 100, channel: 1 });
  });

  it('parses a note-on on other channels', () => {
    expect(parseMidiMessage([0x91, 64, 80])).toEqual({ type: 'noteOn', note: 64, velocity: 80, channel: 2 });
    expect(parseMidiMessage([0x9f, 67, 1])?.channel).toBe(16);
  });

  it('treats note-on with velocity 0 as note-off', () => {
    expect(parseMidiMessage([144, 60, 0])).toEqual({ type: 'noteOff', note: 60, velocity: 0, channel: 1 });
  });

  it('parses a real note-off message', () => {
    expect(parseMidiMessage([0x80, 60, 64])).toEqual({ type: 'noteOff', note: 60, velocity: 0, channel: 1 });
  });

  it('ignores messages that are not notes', () => {
    expect(parseMidiMessage([0xb0, 64, 127])).toBeNull(); // sustain pedal (control change)
    expect(parseMidiMessage([0xf8])).toBeNull(); // clock
  });

  it('ignores empty or malformed input', () => {
    expect(parseMidiMessage(undefined)).toBeNull();
    expect(parseMidiMessage([])).toBeNull();
  });
});
