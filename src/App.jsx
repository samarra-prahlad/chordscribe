import useMidiInput from "./hooks/useMidiInput";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const {midiStatus, notes} = useMidiInput();
  return (
    <div>
      <h1>ChordScribe</h1>
      <p>MIDI status: {midiStatus} </p>
    </div>
  );

}
export default App;