import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

describe('MIDI connection status', () => {
  it('shows connected status when a MIDI device is found', async () => {
    globalThis.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
      inputs: new Map([['id1', { name: 'IAC Driver Bus 1' }]]),
    });
    render(<App />);
    const status = await screen.findByText(/Connected: IAC Driver Bus 1/);
    expect(status).toBeInTheDocument();
  });

  it('shows "no device found" when MIDI access succeeds but nothing is connected', async () => {
    globalThis.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
      inputs: new Map(),
    });
    render(<App />);
    const status = await screen.findByText(/No MIDI device found/);
    expect(status).toBeInTheDocument();
  });

  it('shows an error message when MIDI access is denied', async () => {
    globalThis.navigator.requestMIDIAccess = vi.fn().mockRejectedValue(new Error('denied'));
    render(<App />);
    const status = await screen.findByText(/MIDI access denied or unsupported/);
    expect(status).toBeInTheDocument();
  });
});

describe('Computer keyboard fallback', () => {
  it('shows notes played on the computer keyboard when no MIDI device is connected', async () => {
    globalThis.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({ inputs: new Map() });
    render(<App />);
    await screen.findByText(/No MIDI device found/);

    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.keyDown(window, { key: 'g' });
    expect(screen.getByTestId('active-notes')).toHaveTextContent('C4 E4 G4');

    fireEvent.keyUp(window, { key: 'd' });
    expect(screen.getByTestId('active-notes')).toHaveTextContent('C4 G4');
    expect(screen.getByTestId('recent-notes')).toHaveTextContent('C4 E4 G4');
  });
});
