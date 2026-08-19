import { useState, useEffect } from 'react';

function useMidiInput() {
    const [midiStatus, setMidiStatus] = useState('Not connected');
    const [notes, setNotes] = useState([]);

    useEffect(()=> {
        navigator.requestMIDIAccess()
        .then((midiAccess)=> {
            const inputs = [...midiAccess.inputs.values()];
            if (inputs.length > 0) {
                setMidiStatus(`Connected: ${inputs[0].name}`);
                inputs[0].onmidimessage = (message) => {
                    const [status, note, velocity] = message.data;
                    if (status == 144 && velocity > 0) {
                        setNotes((prevNotes) => [...prevNotes, {note, velocity}]);
                    }
                }
            } else {
                setMidiStatus(`No MIDI device found`);
            }
        })
        .catch (() => {
            setMidiStatus(`MIDI access denied or unsupported`);
        });
    }, []);
    return {midiStatus, notes};
}

export default useMidiInput;