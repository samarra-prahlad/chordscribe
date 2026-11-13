import { useState, useEffect, useRef } from 'react';
import { keyToMidiNote, clampOctave, DEFAULT_OCTAVE } from '../midi/keyboardMap';

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

// Plays notes from the computer keyboard so ChordScribe works without a MIDI device.
function useComputerKeyboard({ onNoteOn, onNoteOff, enabled = true }) {
  const [octave, setOctave] = useState(DEFAULT_OCTAVE);
  const octaveRef = useRef(octave);
  // key -> note it started, so releasing a key after an octave change stops the right note
  const heldKeys = useRef(new Map());

  useEffect(() => {
    octaveRef.current = octave;
  }, [octave]);

  useEffect(() => {
    if (!enabled) return undefined;
    const held = heldKeys.current;

    const handleKeyDown = (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();

      if (key === 'z' || key === 'x') {
        setOctave((o) => clampOctave(o + (key === 'x' ? 1 : -1)));
        return;
      }

      const note = keyToMidiNote(key, octaveRef.current);
      if (note === null || held.has(key)) return;
      held.set(key, note);
      onNoteOn(note, 100);
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (!held.has(key)) return;
      onNoteOff(held.get(key));
      held.delete(key);
    };

    // If the window loses focus mid-chord, release everything so notes don't get stuck.
    const releaseAll = () => {
      held.forEach((note) => onNoteOff(note));
      held.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseAll);
      releaseAll();
    };
  }, [enabled, onNoteOn, onNoteOff]);

  return { octave };
}

export default useComputerKeyboard;
