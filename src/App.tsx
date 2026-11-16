import useMidiInput from './hooks/useMidiInput';
import useComputerKeyboard from './hooks/useComputerKeyboard';
import { midiNoteToName } from './midi/noteNames';

function App() {
  const { midiStatus, notes, activeNotes, noteOn, noteOff } = useMidiInput();
  const { octave } = useComputerKeyboard({ onNoteOn: noteOn, onNoteOff: noteOff });

  const recent = notes.slice(-8);

  return (
    <div>
      <h1>ChordScribe</h1>
      <p>MIDI status: {midiStatus} </p>
      <p>
        No keyboard? Play with A–K (white keys) and W E T Y U (black keys). Z / X
        change octave (currently {octave}).
      </p>

      <h2>Holding</h2>
      <p data-testid="active-notes">
        {activeNotes.length > 0 ? activeNotes.map(midiNoteToName).join(' ') : '—'}
      </p>

      <h2>Recent notes</h2>
      <p data-testid="recent-notes">
        {recent.length > 0 ? recent.map((n) => midiNoteToName(n.note)).join(' ') : '—'}
      </p>
    </div>
  );
}
export default App;
