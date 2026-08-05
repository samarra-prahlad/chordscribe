import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [midiStatus, setMidiStatus] = useState('Not connected');
  useEffect(() => {
    navigator.requestMIDIAccess()
    .then((midiAccess) => {
      const inputs = [...midiAccess.inputs.values()];
      if(inputs.length > 0) {
        setMidiStatus(`Connected: ${inputs[0].name}`);
      } else {
        setMidiStatus(`No MIDI device found`);
      }
    })
    .catch(() => {
      setMidiStatus('MIDI access denied or unsupported');
    });
  }, []);
  return (
    <div>
      <h1>ChordScribe</h1>
      <p>MIDI status: {midiStatus} </p>
    </div>
  );

}
export default App;