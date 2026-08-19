import { render, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useMidiInput from '../hooks/useMidiInput';

describe ('useMidiInput note capture', () => {
    it ('adds a note to the ntoes list when a note-on message is received', async () => {
        const testInput = { name : 'Test keyboard1', onmidimessage: null };
        global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
            inputs: new Map ([['id1', testInput]]),
        });
        const { result } = renderHook(() => useMidiInput());

        await waitFor (() => {
            expect(testInput.onmidimessage).not.toBeNull();
        });
        testInput.onmidimessage({data: [144, 60, 100]});
        await waitFor(() => {
            expect(result.current.notes).toContainEqual({ note: 60, velocity: 100 });
        });
    });
});