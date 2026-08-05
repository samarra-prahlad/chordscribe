import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

describe('MIDI connection status', () => {
  it('shows connected status when a MIDI device is found', async () => {
    global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
      inputs: new Map([['id1', { name: 'IAC Driver Bus 1' }]]),
    });
    render(<App />);
    const status = await screen.findByText(/Connected: IAC Driver Bus 1/);
    expect(status).toBeInTheDocument();
  });

  it('shows "no device found" when MIDI access succeeds but nothing is connected', async () => {
    global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
      inputs: new Map(),
    });
    render(<App />);
    const status = await screen.findByText(/No MIDI device found/);
    expect(status).toBeInTheDocument();
  });

  it('shows an error message when MIDI access is denied', async () => {
    global.navigator.requestMIDIAccess = vi.fn().mockRejectedValue(new Error('denied'));
    render(<App />);
    const status = await screen.findByText(/MIDI access denied or unsupported/);
    expect(status).toBeInTheDocument();
  });
});
