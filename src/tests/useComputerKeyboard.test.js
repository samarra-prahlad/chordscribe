import { renderHook, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useComputerKeyboard from '../hooks/useComputerKeyboard';

function setup() {
  const onNoteOn = vi.fn();
  const onNoteOff = vi.fn();
  const hook = renderHook(() => useComputerKeyboard({ onNoteOn, onNoteOff }));
  return { onNoteOn, onNoteOff, ...hook };
}

describe('useComputerKeyboard', () => {
  it('plays and releases a note', () => {
    const { onNoteOn, onNoteOff } = setup();
    fireEvent.keyDown(window, { key: 'a' });
    expect(onNoteOn).toHaveBeenCalledWith(60, 100);
    fireEvent.keyUp(window, { key: 'a' });
    expect(onNoteOff).toHaveBeenCalledWith(60);
  });

  it('ignores key auto-repeat while a key is held', () => {
    const { onNoteOn } = setup();
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'a', repeat: true });
    fireEvent.keyDown(window, { key: 'a' });
    expect(onNoteOn).toHaveBeenCalledTimes(1);
  });

  it('plays a chord when several keys are held', () => {
    const { onNoteOn } = setup();
    ['a', 'd', 'g'].forEach((key) => fireEvent.keyDown(window, { key }));
    expect(onNoteOn.mock.calls.map((c) => c[0])).toEqual([60, 64, 67]);
  });

  it('changes octave with z and x', () => {
    const { onNoteOn, result } = setup();
    act(() => { fireEvent.keyDown(window, { key: 'x' }); });
    expect(result.current.octave).toBe(5);
    fireEvent.keyDown(window, { key: 'a' });
    expect(onNoteOn).toHaveBeenCalledWith(72, 100);
  });

  it('releases the note it started even if the octave changed while held', () => {
    const { onNoteOff } = setup();
    fireEvent.keyDown(window, { key: 'a' });
    act(() => { fireEvent.keyDown(window, { key: 'z' }); });
    fireEvent.keyUp(window, { key: 'a' });
    expect(onNoteOff).toHaveBeenCalledWith(60);
  });

  it('releases held notes when the window loses focus', () => {
    const { onNoteOff } = setup();
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'd' });
    fireEvent.blur(window);
    expect(onNoteOff).toHaveBeenCalledWith(60);
    expect(onNoteOff).toHaveBeenCalledWith(64);
  });

  it('ignores typing in text fields and shortcuts', () => {
    const { onNoteOn } = setup();
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: 'a' });
    fireEvent.keyDown(window, { key: 's', metaKey: true });
    expect(onNoteOn).not.toHaveBeenCalled();
    input.remove();
  });
});
