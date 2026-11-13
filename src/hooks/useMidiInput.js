import { useState, useEffect, useCallback } from 'react';
import { parseMidiMessage } from '../midi/parseMidiMessage';

// Single source of truth for notes. Anything can feed it: a real MIDI device,
// the computer keyboard (see useComputerKeyboard) or a test.
const UNSUPPORTED = 'MIDI access denied or unsupported';

function isMidiSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.requestMIDIAccess);
}

function useMidiInput() {
  const [midiStatus, setMidiStatus] = useState(() =>
    isMidiSupported() ? 'Not connected' : UNSUPPORTED,
  );
  const [notes, setNotes] = useState([]); // history of every note played
  const [activeNotes, setActiveNotes] = useState([]); // notes held down right now

  const noteOn = useCallback((note, velocity = 100) => {
    setNotes((prev) => [...prev, { note, velocity }]);
    setActiveNotes((prev) =>
      prev.includes(note) ? prev : [...prev, note].sort((a, b) => a - b),
    );
  }, []);

  const noteOff = useCallback((note) => {
    setActiveNotes((prev) => prev.filter((n) => n !== note));
  }, []);

  useEffect(() => {
    if (!isMidiSupported()) return undefined; // status already set to UNSUPPORTED

    let inputs = [];
    let cancelled = false;

    const handleMessage = (message) => {
      const event = parseMidiMessage(message.data);
      if (!event) return;
      if (event.type === 'noteOn') noteOn(event.note, event.velocity);
      else noteOff(event.note);
    };

    navigator
      .requestMIDIAccess()
      .then((midiAccess) => {
        if (cancelled) return;
        inputs = [...midiAccess.inputs.values()];
        if (inputs.length > 0) {
          setMidiStatus(`Connected: ${inputs.map((i) => i.name).join(', ')}`);
          inputs.forEach((input) => {
            input.onmidimessage = handleMessage;
          });
        } else {
          setMidiStatus('No MIDI device found');
        }
      })
      .catch(() => {
        if (!cancelled) setMidiStatus(UNSUPPORTED);
      });

    return () => {
      cancelled = true;
      inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [noteOn, noteOff]);

  return { midiStatus, notes, activeNotes, noteOn, noteOff };
}

export default useMidiInput;
