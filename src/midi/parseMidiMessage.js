// Turns a raw Web MIDI message (e.g. [144, 60, 100]) into a plain object.
// Pure function: no browser APIs, so it is easy to unit test.
//
// The high 4 bits of the status byte are the message type and the low 4 bits
// are the channel, so 0x90-0x9F are all "note on" (channels 1-16).
// Many keyboards send "note on with velocity 0" instead of a real "note off".
const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;

export function parseMidiMessage(data) {
  if (!data || data.length < 3) return null;

  const [status, note, velocity] = data;
  const type = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  if (type === NOTE_ON && velocity > 0) {
    return { type: 'noteOn', note, velocity, channel };
  }
  if (type === NOTE_OFF || (type === NOTE_ON && velocity === 0)) {
    return { type: 'noteOff', note, velocity: 0, channel };
  }
  return null; // control change, pitch bend, clock, etc. are ignored for now
}
