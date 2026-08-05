import { useState } from "react";

function App() {
  const [midiStatus, setMidiStatus] = useState('Not connected');
  return (
    <div>
      <h1>ChordScribe</h1>
      <p>MIDI status: {midiStatus} </p>
    </div>
  );

}
export default App;