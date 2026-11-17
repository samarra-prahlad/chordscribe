import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import useMidiInput from '../hooks/useMidiInput';

interface FakeMidiInput {
  name: string;
  state: 'connected' | 'disconnected';
  onmidimessage: ((event: { data: number[] }) => void) | null;
}

interface FakeMidiAccess  {
  inputs: Map<string, FakeMidiInput>
  onstatechange: (() => void ) | null;
}

function mockMidiDevice(name = 'Test keyboard1') {
  const testInput: FakeMidiInput = { name, onmidimessage: null, state: 'connected' };
  mockMidiAccess().inputs.set('id1', testInput);
  return testInput;
}

function mockMidiAccess() {
  const fakeAccess: FakeMidiAccess = {inputs: new Map(), onstatechange: null};
  globalThis.navigator.requestMIDIAccess = vi.fn().mockResolvedValue(fakeAccess);
  return fakeAccess;
}

async function renderWithDevice() {
  const testInput = mockMidiDevice();
  const hook = renderHook(() => useMidiInput());
  await waitFor(() => expect(testInput.onmidimessage).not.toBeNull());
  const send = (data: number[]) => act(() => testInput.onmidimessage!({ data }));
  return { testInput, send, ...hook };
}

afterEach(() => {
  delete (globalThis.navigator as Partial<Navigator>).requestMIDIAccess;
});

describe('useMidiInput note capture', () => {
  it('adds a note to the notes list when a note-on message is received', async () => {
    const { result, send } = await renderWithDevice();
    send([144, 60, 100]);
    expect(result.current.notes).toContainEqual({ note: 60, velocity: 100 });
  });

  it('accepts note-on messages from any MIDI channel', async () => {
    const { result, send } = await renderWithDevice();
    send([0x93, 62, 90]);
    expect(result.current.notes).toContainEqual({ note: 62, velocity: 90 });
  });

  it('tracks which notes are held and releases them on note-off', async () => {
    const { result, send } = await renderWithDevice();
    send([144, 67, 100]);
    send([144, 60, 100]);
    send([144, 64, 100]);
    expect(result.current.activeNotes).toEqual([60, 64, 67]);

    send([128, 64, 0]); // real note-off
    send([144, 60, 0]); // note-on with velocity 0
    expect(result.current.activeNotes).toEqual([67]);
  });

  it('detaches the MIDI handler on unmount', async () => {
    const { testInput, unmount } = await renderWithDevice();
    unmount();
    expect(testInput.onmidimessage).toBeNull();
  });
});

describe('useMidiInput without a device', () => {
  it('reports unsupported when the browser has no Web MIDI API', () => {
    delete (globalThis.navigator as Partial<Navigator>).requestMIDIAccess;
    const { result } = renderHook(() => useMidiInput());
    expect(result.current.midiStatus).toBe('MIDI access denied or unsupported');
  });

  it('still accepts notes from other sources (e.g. the computer keyboard)', () => {
    delete (globalThis.navigator as Partial<Navigator>).requestMIDIAccess;
    const { result } = renderHook(() => useMidiInput());
    act(() => result.current.noteOn(60));
    expect(result.current.activeNotes).toEqual([60]);
    act(() => result.current.noteOff(60));
    expect(result.current.activeNotes).toEqual([]);
  });
});

describe ('useMidiInput hot-plugging', () => {
  it ('checks if the keyboard is plugged in later', async () => {
    const testAccess = mockMidiAccess();
    const{ result }= renderHook (() => useMidiInput());
    await waitFor(() => expect (result.current.midiStatus).toBe ('No MIDI device found'));
    const testInput: FakeMidiInput = { name: 'Late keyboard', state: 'connected', onmidimessage: null};
    testAccess.inputs.set('id1', testInput);
    act(() => testAccess.onstatechange!());
    expect(result.current.midiStatus).toContain('Connected');


  });
  it ('checks if the keyboard has been unplugged', async () => {
    const { result, unmount } = await renderWithDevice();
    unmount();
    
  })
});