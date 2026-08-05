import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

describe('MIDI connection status', () => {
    it('shows connected status when a MIDI device is found', async () => {
        global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue ({
            inputs: new Map([['id1', { name: 'IAC Driver Bus 1 '}]]),
        });
        render(<App/>);
        const status = await screen.findByText(/Connected: IAC Driver Bus 1/);
        expect(status).toBeInTheDocument();
    })

    it('shows "no device found" when MIDI access succeeds but nothing is connected', async () => {
        global.navigator.requestMIDIAccess = vi.fn(mockResolvedValue) ({
            inputs: newMap(),
        });
        render(<App/>);
        const status = await screen.findByText(/No MIDI device found/);
        expect(status).toBeInTheDocument;
    });
})